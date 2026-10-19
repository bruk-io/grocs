import { InviteJoinTemplate } from '@grocs/ui';
import { useGo } from './navigate.ts';

/** The invite a partner opens, with sample data. Join with Google leads to Meal plan. */
export function JoinInviteScreen() {
  const go = useGo();
  return (
    <InviteJoinTemplate
      inviter="Bruk"
      kitchen="Our kitchen"
      description="Plan the week's meals together and shop from one shared list, live on both phones."
      onJoin={go.plan}
    />
  );
}
