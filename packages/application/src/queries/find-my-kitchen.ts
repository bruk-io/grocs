import type { Deps } from '../dispatch/types.ts';

/**
 * The signed-in member's kitchen, found on any phone (R2, TASK-14); null when nobody is signed in or they have none yet.
 * Throws when the composition supplies no KitchenGateway, which is a wiring mistake, not a state to show (decision-13).
 */
export async function findMyKitchen(deps: Deps): Promise<string | null> {
  if (!deps.auth.currentUser()) return null;
  if (!deps.kitchens) throw new Error('kitchens-unavailable: this composition supplies no KitchenGateway');
  return deps.kitchens.findMyKitchen();
}
