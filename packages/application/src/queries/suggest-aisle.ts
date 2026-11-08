import { aisleNameKey } from '@grocs/core';
import type { Deps } from '../dispatch/types.ts';

/**
 * The aisle remembered for this name from the kitchen's earlier choices (R11, R14), or null if
 * none has been. A name with no key yet (e.g. '!!', whose letters and digits are all stripped)
 * never reaches aisleFor: an empty document id is not valid in Firestore, and this runs as the
 * name is typed. The memory only ever helps: a failed lookup is also null, never an exception,
 * since the screen calls this on every keystroke.
 */
export async function suggestAisle(deps: Deps, kitchenId: string, name: string): Promise<string | null> {
  const nameKey = aisleNameKey(name);
  if (nameKey === '') return null;
  return deps.syncStore.aisleFor(kitchenId, nameKey).catch(() => null);
}
