import type { Deps } from '../dispatch/types.ts';

/**
 * The signed-in member's kitchen, found on any phone (R2, TASK-14); null when nobody is signed in or they have none yet.
 */
export async function findMyKitchen(deps: Deps): Promise<string | null> {
  if (!deps.auth.currentUser()) return null;
  return deps.kitchens.findMyKitchen();
}
