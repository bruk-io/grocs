import { useEffect, useState } from 'react';
import type { KitchenInfo } from '@grocs/application';
import { HouseholdTemplate } from '@grocs/ui';
import type { HouseholdInvite, HouseholdMember } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { useEmailInvite } from './use-email-invite.ts';

export interface HouseholdScreenProps {
  app: App;
  kitchenId: string;
}

const COULD_NOT_READ = 'check your connection and try again';

/**
 * Your kitchen and its invite (TASK-56, TASK-78): the members, and while there is room for the
 * partner, their email to add or the one already invited.
 */
export function HouseholdScreen({ app, kitchenId }: HouseholdScreenProps) {
  const go = useGo();
  const [kitchen, setKitchen] = useState<KitchenInfo | null | 'loading' | 'failed'>('loading');
  useEffect(() => {
    let current = true;
    app.getKitchenInfo(kitchenId).then(
      (got) => current && setKitchen(got ?? 'failed'),
      () => current && setKitchen('failed'),
    );
    return () => {
      current = false;
    };
  }, [app, kitchenId]);

  const info = typeof kitchen === 'object' ? kitchen : null;
  const card = useEmailInvite(app, kitchenId, info ? info.invitedEmail : undefined);
  const invite: HouseholdInvite =
    kitchen === 'loading'
      ? { kind: 'loading' }
      : kitchen === 'failed' || kitchen === null
        ? { kind: 'failed', message: COULD_NOT_READ }
        : kitchen.members.length >= 2
          ? { kind: 'full' }
          : card;
  const members: HouseholdMember[] = (info?.members ?? []).map((m) => ({ name: m.name, isYou: m.isCaller }));
  return <HouseholdTemplate kitchenName={info?.name ?? ''} members={members} invite={invite} onBack={go.settings} />;
}
