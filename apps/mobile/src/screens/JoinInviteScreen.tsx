import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import type { JoinKitchen, KitchenJoinRejected, KitchenJoined } from '@grocs/application';
import type { JoinRejectedReason } from '@grocs/ports';
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

  const join = async (raw: string) => {
    const typed = raw.trim().toUpperCase();
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
        inviter="Your partner"
        kitchen="Our kitchen"
        description="Plan the week's meals together and shop from one shared list, live on both phones."
        joining={busy}
        onJoin={() => void join(linked)}
      />
    );
  }
  // Nothing has been checked yet: a neutral code entry. After a rejection it becomes the retry shape.
  if (linked === null && error === undefined) {
    return <InviteRetryTemplate attempt="first" code={code} onCodeChange={setCode} checking={busy} onCheck={() => void join(code)} />;
  }
  return (
    <InviteRetryTemplate
      inviter="your partner"
      code={code}
      onCodeChange={setCode}
      checking={busy}
      onCheck={() => void join(code)}
      onBack={linked !== null ? () => setShowEntry(false) : go.welcome}
      {...(error ? { errorMessage: error } : {})}
    />
  );
}
