// Merging two copies of the same item (R17 to R20). The merge is what both phones and the
// sync store apply, so it lives once, here.
import type { Item } from '../model/item.ts';
import { laterStamp, mergeStamped } from './lww.ts';

const union = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])].sort();

/**
 * Merge two copies of one item. Each field keeps its later write; badges are unioned; a deletion
 * is permanent, so a late change made before the delete can never bring the item back (R20).
 * Commutative, associative and idempotent.
 */
export function mergeItem(a: Item, b: Item): Item {
  if (a.id !== b.id) throw new Error(`cannot merge different items: ${a.id} and ${b.id}`);
  const first = a.createdAt < b.createdAt || (a.createdAt === b.createdAt && a.addedBy <= b.addedBy) ? a : b;
  return {
    id: a.id,
    weekId: first.weekId,
    addedBy: first.addedBy,
    createdAt: first.createdAt,
    name: mergeStamped(a.name, b.name),
    amount: mergeStamped(a.amount, b.amount),
    aisle: mergeStamped(a.aisle, b.aisle),
    state: mergeStamped(a.state, b.state),
    badges: union(a.badges, b.badges),
    deleted: laterStamp(a.deleted, b.deleted),
  };
}

export const isDeleted = (item: Item): boolean => item.deleted !== null;
