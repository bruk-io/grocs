import type { Deps } from '../dispatch/types.ts';

export interface KitchenInfoMember {
  readonly uid: string;
  readonly name: string;
  readonly isCaller: boolean;
}

export interface KitchenInfo {
  readonly name: string;
  readonly members: readonly KitchenInfoMember[];
}

/**
 * A kitchen's name and members, for Settings and Household (TASK-27). The gateway's KitchenDetails
 * stays data-only; this is the one place that knows which member is the caller, from the
 * signed-in session, the same split decision-13 draws between a gateway and an application query.
 */
export async function getKitchenInfo(deps: Deps, kitchenId: string): Promise<KitchenInfo | null> {
  const details = await deps.kitchens.getKitchen(kitchenId);
  if (!details) return null;
  const callerUid = deps.auth.currentUser()?.uid;
  return { name: details.name, members: details.members.map((m) => ({ ...m, isCaller: m.uid === callerUid })) };
}
