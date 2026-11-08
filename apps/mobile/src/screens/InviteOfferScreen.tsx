import { useEffect, useState } from 'react';
import type { AcceptInvite, KitchenJoined, KitchenJoinRejected } from '@grocs/application';
import type { AcceptRejectedReason, InviteOffer } from '@grocs/ports';
import { InviteJoinTemplate } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';

/** One message per refusal, shown on the offer (R3). */
export const JOIN_REJECTION_MESSAGES: Record<AcceptRejectedReason, string> = {
  'not-found': 'That invite is no longer there. Your partner may have taken it back or invited another address.',
  full: 'That kitchen already has both its members.',
  'already-member': 'You are already in that kitchen.',
};
export const COULD_NOT_JOIN = 'We could not join. Check your connection and try again.';

export interface InviteOfferScreenProps {
  app: App;
  offer: InviteOffer;
  /** The kitchen the person is in now, or null. Joining leaves it. */
  currentKitchenId: string | null;
  onJoined: (kitchenId: string) => void;
  onNotNow: () => void;
}

/** An invite waiting for the signed-in person's email (TASK-78): join it, or put it aside for now. */
export function InviteOfferScreen({ app, offer, currentKitchenId, onJoined, onNotNow }: InviteOfferScreenProps) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [leaving, setLeaving] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (currentKitchenId === null) return;
    let current = true;
    app.getKitchenInfo(currentKitchenId).then(
      (info) => current && setLeaving(info?.name ?? 'your kitchen'),
      () => current && setLeaving('your kitchen'),
    );
    return () => {
      current = false;
    };
  }, [app, currentKitchenId]);

  const join = async () => {
    setError(undefined);
    setJoining(true);
    try {
      const command: AcceptInvite = { type: 'AcceptInvite', kitchenId: offer.kitchenId };
      const result = await app.dispatch(command);
      const events = result.ok ? result.value : [];
      const joined = events.find((e): e is KitchenJoined => e.type === 'KitchenJoined');
      if (joined) {
        onJoined(joined.kitchenId);
        return;
      }
      const refused = events.find((e): e is KitchenJoinRejected => e.type === 'KitchenJoinRejected');
      setError(refused ? JOIN_REJECTION_MESSAGES[refused.reason] : COULD_NOT_JOIN);
    } catch {
      setError(COULD_NOT_JOIN);
    }
    setJoining(false);
  };

  return (
    <InviteJoinTemplate
      inviter={offer.inviter || 'Your partner'}
      kitchen={offer.kitchen}
      description="Plan the week's meals together and shop from one shared list, live on both phones."
      joining={joining}
      onJoin={() => void join()}
      onNotNow={onNotNow}
      {...(currentKitchenId !== null ? { leaving: leaving ?? 'your kitchen' } : {})}
      {...(error !== undefined ? { errorMessage: error } : {})}
    />
  );
}
