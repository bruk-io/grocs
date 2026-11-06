import { useEffect, useState } from 'react';
import { Share } from 'react-native';
import { HouseholdTemplate } from '@grocs/ui';
import type { HouseholdInvite, HouseholdMember } from '@grocs/ui';
import type { KitchenInvite } from '@grocs/ports';
import type { App } from '../composition/compose-app.ts';
import { inviteMessage } from './invite.ts';
import { localExpiryLabel } from './invite-expiry.ts';
import { useGo } from './navigate.ts';
import { useKitchenInfo } from './use-kitchen-info.ts';

export interface HouseholdScreenProps {
  app: App;
  kitchenId: string;
}

const COULD_NOT_FETCH = 'check your connection and try again';

/**
 * Your kitchen and its invite (TASK-56): the members, and while there is room for the partner the
 * code to send them. The server reuses a working invite or issues a fresh one, since an invite lasts
 * a day and the kitchen may be weeks old.
 */
export function HouseholdScreen({ app, kitchenId }: HouseholdScreenProps) {
  const go = useGo();
  const kitchen = useKitchenInfo(app, kitchenId);
  const [got, setGot] = useState<KitchenInvite | 'loading' | 'failed'>('loading');

  useEffect(() => {
    let current = true;
    app.getKitchenInvite(kitchenId).then(
      (next) => current && setGot(next),
      () => current && setGot('failed'),
    );
    return () => {
      current = false;
    };
  }, [app, kitchenId]);

  const you = kitchen?.members.find((m) => m.isCaller)?.name;
  const sender = { ...(you ? { inviter: you } : {}), ...(kitchen ? { kitchen: kitchen.name } : {}) };
  const invite: HouseholdInvite =
    got === 'loading'
      ? { kind: 'loading' }
      : got === 'failed'
        ? { kind: 'failed', message: COULD_NOT_FETCH }
        : got.kind === 'full'
          ? { kind: 'full' }
          : {
              kind: 'open',
              code: got.code,
              expires: localExpiryLabel(got.expiresAt, app.now()),
              onShare: () => void Share.share({ message: inviteMessage(got.code, sender) }),
              onCopy: () => void app.copyText(got.code),
            };
  const members: HouseholdMember[] = (kitchen?.members ?? []).map((m) => ({ name: m.name, isYou: m.isCaller }));
  return <HouseholdTemplate kitchenName={kitchen?.name ?? ''} members={members} invite={invite} onBack={go.settings} />;
}
