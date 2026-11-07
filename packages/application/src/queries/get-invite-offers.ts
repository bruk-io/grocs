import type { InviteOffer } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/** The invites waiting for the signed-in person's email, oldest first; none when nobody is signed in (R3, TASK-78). */
export async function getInviteOffers(deps: Deps): Promise<readonly InviteOffer[]> {
  if (!deps.auth.currentUser()) return [];
  return deps.kitchens.invitesForMe();
}
