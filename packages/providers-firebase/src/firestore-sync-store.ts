import { decodeItem, decodeMeal, encodeItem, encodeMeal, mergeItem, mergeMeal } from '@grocs/core';
import type { Item, Meal } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';
import type { FirestoreFns, QuerySnapshotLike } from './sdk.ts';

/**
 * The kitchen's items and meals in Firestore: `kitchens/{kitchenId}/items/{itemId}` and
 * `kitchens/{kitchenId}/meals/{mealId}`, one document per item or meal in the shape core defines
 * (R30). It translates; the merge rules are core's (field-level last-write-wins, permanent
 * deletes).
 *
 * mergeItem and mergeMeal read, merge and write in a transaction so two phones changing different
 * fields at the same moment keep both changes. A Firestore transaction needs a connection, so a
 * merge made offline fails instead of queueing; making R16 work is part of design question D4.
 */
export class FirestoreSyncStore implements SyncStore {
  readonly #fs: FirestoreFns;
  readonly #db: unknown;

  constructor(fs: FirestoreFns, db: unknown) {
    this.#fs = fs;
    this.#db = db;
  }

  async mergeItem(kitchenId: string, item: Item): Promise<void> {
    const ref = this.#fs.doc(this.#db, 'kitchens', kitchenId, 'items', item.id);
    await this.#fs.runTransaction(this.#db, async (tx) => {
      const snapshot = await tx.get(ref);
      let merged = item;
      if (snapshot.exists()) {
        const stored = decodeItem(snapshot.data());
        if (!stored.ok) throw new Error(`invalid item document ${item.id}: ${stored.error.path} ${stored.error.message}`);
        merged = mergeItem(stored.value, item);
      }
      tx.set(ref, encodeItem(merged));
    });
  }

  async getItems(kitchenId: string, weekId: string): Promise<readonly Item[]> {
    const snapshot = await this.#fs.getDocs(this.#weekQuery(kitchenId, weekId));
    const { items, problems } = decodeAll(snapshot);
    if (problems.length > 0) throw new Error(problems.join('; '));
    return items;
  }

  watchItems(
    kitchenId: string,
    weekId: string,
    onItems: (items: readonly Item[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.#fs.onSnapshot(this.#weekQuery(kitchenId, weekId), {
      next: (snapshot) => {
        const { items, problems } = decodeAll(snapshot);
        for (const problem of problems) onError?.(new Error(problem));
        onItems(items);
      },
      error: (error) => onError?.(error),
    });
  }

  async mergeMeal(kitchenId: string, meal: Meal): Promise<void> {
    const ref = this.#fs.doc(this.#db, 'kitchens', kitchenId, 'meals', meal.id);
    await this.#fs.runTransaction(this.#db, async (tx) => {
      const snapshot = await tx.get(ref);
      let merged = meal;
      if (snapshot.exists()) {
        const stored = decodeMeal(snapshot.data());
        if (!stored.ok) throw new Error(`invalid meal document ${meal.id}: ${stored.error.path} ${stored.error.message}`);
        merged = mergeMeal(stored.value, meal);
      }
      tx.set(ref, encodeMeal(merged));
    });
  }

  async getMeals(kitchenId: string, weekId: string): Promise<readonly Meal[]> {
    const snapshot = await this.#fs.getDocs(this.#mealWeekQuery(kitchenId, weekId));
    const { meals, problems } = decodeAllMeals(snapshot);
    if (problems.length > 0) throw new Error(problems.join('; '));
    return meals;
  }

  watchMeals(
    kitchenId: string,
    weekId: string,
    onMeals: (meals: readonly Meal[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.#fs.onSnapshot(this.#mealWeekQuery(kitchenId, weekId), {
      next: (snapshot) => {
        const { meals, problems } = decodeAllMeals(snapshot);
        for (const problem of problems) onError?.(new Error(problem));
        onMeals(meals);
      },
      error: (error) => onError?.(error),
    });
  }

  #weekQuery(kitchenId: string, weekId: string): unknown {
    return this.#fs.query(this.#fs.collection(this.#db, 'kitchens', kitchenId, 'items'), this.#fs.where('weekId', '==', weekId));
  }

  /** Meal's stored weekId is a Stamped field (StoredField), unlike Item's plain string, so the query reads weekId.v. */
  #mealWeekQuery(kitchenId: string, weekId: string): unknown {
    return this.#fs.query(this.#fs.collection(this.#db, 'kitchens', kitchenId, 'meals'), this.#fs.where('weekId.v', '==', weekId));
  }
}

function decodeAll(snapshot: QuerySnapshotLike): { items: Item[]; problems: string[] } {
  const items: Item[] = [];
  const problems: string[] = [];
  for (const doc of snapshot.docs) {
    const decoded = decodeItem(doc.data());
    if (decoded.ok) items.push(decoded.value);
    else problems.push(`invalid item document ${doc.id}: ${decoded.error.path} ${decoded.error.message}`);
  }
  return { items, problems };
}

function decodeAllMeals(snapshot: QuerySnapshotLike): { meals: Meal[]; problems: string[] } {
  const meals: Meal[] = [];
  const problems: string[] = [];
  for (const doc of snapshot.docs) {
    const decoded = decodeMeal(doc.data());
    if (decoded.ok) meals.push(decoded.value);
    else problems.push(`invalid meal document ${doc.id}: ${decoded.error.path} ${decoded.error.message}`);
  }
  return { meals, problems };
}
