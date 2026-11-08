// Adding the partner's email and taking it back (TASK-78), shared by Kitchen setup and Household so
// both say the same thing for each outcome.
import { useEffect, useState } from 'react';
import type { CancelInvite, InviteByEmail, InviteRejected, PartnerInvited } from '@grocs/application';
import type { InviteByEmailRejectedReason } from '@grocs/ports';
import type { InviteCardComposeProps, InviteCardInvitedProps } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';

/** One message per refusal, shown under the email field. */
export const INVITE_REJECTION_MESSAGES: Record<InviteByEmailRejectedReason, string> = {
  'invalid-email': 'That is not an email address. Check it and try again.',
  'own-email': "That is your own email. Add your partner's.",
  full: 'Your kitchen already has both its members.',
};
export const COULD_NOT_INVITE = 'We could not send the invite. Check your connection and try again.';

/**
 * The invite card's props for `kitchenId`. `invited` is the email the server says is invited now,
 * once known (undefined while it is still being read); a later invite or cancel here replaces it.
 */
export function useEmailInvite(app: App, kitchenId: string, invited: string | null | undefined): InviteCardComposeProps | InviteCardInvitedProps {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [current, setCurrent] = useState<string | null>(invited ?? null);
  const [cancelling, setCancelling] = useState(false);
  useEffect(() => {
    if (invited !== undefined) setCurrent(invited);
  }, [invited]);

  const invite = async () => {
    setErrorMessage(undefined);
    setSending(true);
    try {
      const command: InviteByEmail = { type: 'InviteByEmail', kitchenId, email };
      const result = await app.dispatch(command);
      const events = result.ok ? result.value : [];
      const sent = events.find((e): e is PartnerInvited => e.type === 'PartnerInvited');
      const refused = events.find((e): e is InviteRejected => e.type === 'InviteRejected');
      if (sent) {
        setCurrent(sent.email);
        setEmail('');
      } else setErrorMessage(refused ? INVITE_REJECTION_MESSAGES[refused.reason] : COULD_NOT_INVITE);
    } catch {
      setErrorMessage(COULD_NOT_INVITE);
    } finally {
      setSending(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const command: CancelInvite = { type: 'CancelInvite', kitchenId };
      const result = await app.dispatch(command);
      if (result.ok) setCurrent(null);
    } catch {
      // A failed cancel is logged by the instrumented port; the invite still shows, so they can try again.
    } finally {
      setCancelling(false);
    }
  };

  if (current !== null) return { kind: 'invited', email: current, onCancel: () => void cancel(), cancelling };
  return {
    kind: 'compose',
    email,
    onEmailChange: (next) => {
      setEmail(next);
      setErrorMessage(undefined);
    },
    sending,
    ...(email.trim() === '' ? {} : { onInvite: () => void invite() }),
    ...(errorMessage !== undefined ? { errorMessage } : {}),
  };
}
