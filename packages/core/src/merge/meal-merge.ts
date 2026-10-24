// Merging two copies of the same meal (R17 to R20), exactly as item-merge.ts does for items: a
// meal is plain same-kitchen CRUD with no cross-kitchen lookup problem.
import type { Meal } from '../model/meal.ts';
import { laterStamp, mergeStamped } from './lww.ts';

/**
 * Merge two copies of one meal. Each field keeps its later write, including weekId and dayIndex,
 * so moving a meal between weeks merges the same way as a rename; a deletion is permanent, so a
 * late change made before the delete can never bring the meal back (R20). Commutative, associative
 * and idempotent.
 */
export function mergeMeal(a: Meal, b: Meal): Meal {
  if (a.id !== b.id) throw new Error(`cannot merge different meals: ${a.id} and ${b.id}`);
  const first = a.createdAt < b.createdAt || (a.createdAt === b.createdAt && a.addedBy <= b.addedBy) ? a : b;
  return {
    id: a.id,
    addedBy: first.addedBy,
    createdAt: first.createdAt,
    weekId: mergeStamped(a.weekId, b.weekId),
    dayIndex: mergeStamped(a.dayIndex, b.dayIndex),
    name: mergeStamped(a.name, b.name),
    link: mergeStamped(a.link, b.link),
    deleted: laterStamp(a.deleted, b.deleted),
  };
}

export const isMealDeleted = (meal: Meal): boolean => meal.deleted !== null;
