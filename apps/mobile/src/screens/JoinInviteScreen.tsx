import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import type { JoinKitchen, KitchenJoinRejected, KitchenJoined } from '@grocs/application';
import type { InvitePreview, JoinRejectedReason } from '@grocs/ports';
import { InviteJoinTemplate, InviteRetryTemplate } from '@grocs/ui';
import { useNativeApp } from '../app-context.tsx';
import { useGo } from './navigate.ts';

/** One inline message per rejection reason, shown where the code was entered (R3). */
export const JOIN_REJECTION_MESSAGES: Record<JoinRejectedReason, string> = {
  'not-found': 'That code is not a match. Check it with your partner, or ask for a fresh link.',
  expired: 'That invite has expired. Ask your partner for a fresh one.',
  used: 'That invite has already been used. Ask your partner for a fresh one.',
  full: 'That kitchen already has two members.',
  'already-member': 'You are already a member of that kitchen.',
};

const COULD_NOT_JOIN = 'We could not check that code. Check your connection and try again.';
export const ENTER_A_CODE = 'Type the code from your invite first.';

/**
 * Joins a kitchen from an invite: opened from the link (code in the URL) it shows the invite, and
 * with no code, or after a refusal, it asks for the code and shows why it did not work.
 */
export function JoinInviteScreen() {
  const { app, signInWithGoogle } = useNativeApp();
  const go = useGo();
  const params = useLocalSearchParams<{ code?: string }>();
  const linked = typeof params.code === 'string' && params.code !== '' ? params.code : null;

  const [code, setCode] = useState(linked ?? '');
  const [showEntry, setShowEntry] = useState(linked === null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // Check code pressed with nothing typed: ask for the code, call nothing (TASK-66).
  const [askForCode, setAskForCode] = useState(false);
  const changeCode = (next: string) => {
    setCode(next);
    setAskForCode(false);
  };
  // Who invited and to which kitchen, from the server once someone is signed in (TASK-70). Never from
  // the link, which anyone can edit; signed out, the screen names nobody.
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => app.watchSession((user) => setSignedIn(user !== null)), [app]);
  useEffect(() => {
    if (!signedIn || linked === null) return;
    let current = true;
    app.previewInvite(linked).then(
      (got) => current && setPreview(got),
      () => undefined,
    );
    return () => {
      current = false;
    };
  }, [app, signedIn, linked]);

  const join = async (raw: string) => {
    const typed = raw.trim().toUpperCase();
    if (typed === '') {
      setAskForCode(true);
      return;
    }
    setAskForCode(false);
    setError(undefined);
    setBusy(true);
    try {
      const command: JoinKitchen = { type: 'JoinKitchen', code: typed };
      let result = await app.dispatch(command);
      // Opened from a link while signed out: sign in with Google, then join (R3).
      if (!result.ok && result.error.code === 'not-signed-in') {
        await signInWithGoogle();
        result = await app.dispatch(command);
      }
      const events = result.ok ? result.value : [];
      if (events.some((e): e is KitchenJoined => e.type === 'KitchenJoined')) {
        go.groceries();
        return;
      }
      const rejected = events.find((e): e is KitchenJoinRejected => e.type === 'KitchenJoinRejected');
      setCode(typed);
      setShowEntry(true);
      setError(rejected ? JOIN_REJECTION_MESSAGES[rejected.reason] : COULD_NOT_JOIN);
    } catch {
      setCode(typed);
      setShowEntry(true);
      setError(COULD_NOT_JOIN);
    } finally {
      setBusy(false);
    }
  };

  if (linked !== null && !showEntry) {
    return (
      <InviteJoinTemplate
        inviter={preview?.inviter ?? 'Your partner'}
        kitchen={preview?.kitchen ?? 'their kitchen'}
        description="Plan the week's meals together and shop from one shared list, live on both phones."
        joining={busy}
        onJoin={() => void join(linked)}
      />
    );
  }
  // Nothing has been checked yet: a neutral code entry. After a rejection it becomes the retry shape.
  if (linked === null && error === undefined) {
    return (
      <InviteRetryTemplate
        attempt="first"
        code={code}
        onCodeChange={changeCode}
        checking={busy}
        onCheck={() => void join(code)}
        {...(askForCode ? { errorMessage: ENTER_A_CODE } : {})}
      />
    );
  }
  return (
    <InviteRetryTemplate
      inviter="your partner"
      code={code}
      onCodeChange={changeCode}
      checking={busy}
      onCheck={() => void join(code)}
      onBack={linked !== null ? () => setShowEntry(false) : go.welcome}
      {...(askForCode ? { errorMessage: ENTER_A_CODE } : error ? { errorMessage: error } : {})}
    />
  );
}
