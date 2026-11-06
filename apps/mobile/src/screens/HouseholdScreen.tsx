import { useEffect, useState } from 'react';
import { Share } from 'react-native';
import { HouseholdTemplate } from '@grocs/ui';
import type { HouseholdInvite, HouseholdMember } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import { inviteMessage } from './invite.ts';
import { localExpiryLabel } from './invite-expiry.ts';
import { useGo } from './navigate.ts';

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
  const [name, setName] = useState('Your kitchen');
  const [members, setMembers] = useState<readonly HouseholdMember[]>([]);
  const [invite, setInvite] = useState<HouseholdInvite>({ kind: 'loading' });

  useEffect(() => {
    let current = true;
    app.getKitchenInfo(kitchenId).then(
      (info) => {
        if (!current || !info) return;
        setName(info.name);
        setMembers(info.members.map((m) => ({ name: m.name, isYou: m.isCaller })));
      },
      () => undefined,
    );
    app.getKitchenInvite(kitchenId).then(
      (got) => {
        if (!current) return;
        setInvite(
          got.kind === 'full'
            ? { kind: 'full' }
            : {
                kind: 'open',
                code: got.code,
                expires: localExpiryLabel(got.expiresAt, app.now()),
                onShare: () => void Share.share({ message: inviteMessage(got.code) }),
                onCopy: () => void app.copyText(got.code),
              },
        );
      },
      () => current && setInvite({ kind: 'failed', message: COULD_NOT_FETCH }),
    );
    return () => {
      current = false;
    };
  }, [app, kitchenId]);

  return <HouseholdTemplate kitchenName={name} members={members} invite={invite} onBack={go.settings} />;
}
