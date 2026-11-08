import {
  decodeAisleMemory,
  decodeItem,
  decodeMeal,
  decodeRecipe,
  encodeAisleMemory,
  encodeItem,
  encodeMeal,
  encodeRecipe,
  mergeItem,
  mergeMeal,
  mergeRecipe,
  mergeStamped,
} from '@grocs/core';
import type { Item, Meal, Recipe, Stamped } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';
import type { FirestoreFns, QuerySnapshotLike } from './sdk.ts';

/**
 * The kitchen's items, meals and recipes in Firestore: `kitchens/{kitchenId}/items/{itemId}`,
 * `kitchens/{kitchenId}/meals/{mealId}` and `kitchens/{kitchenId}/recipes/{recipeId}`, one
 * document per item, meal or recipe in the shape core defines (R30, decision-16). It translates;
 * the merge rules are core's (field-level last-write-wins, permanent deletes).
 *
 * mergeItem, mergeMeal and mergeRecipe read, merge and write in a transaction so two phones
 * changing different fields at the same moment keep both changes. A Firestore transaction needs
 * a connection, so a merge made offline fails instead of queueing; making R16 work is part of
 * design question D4.
 *
 * rememberAisle keeps the aisle-suggestion memory (R11, R14) at
 * `kitchens/{kitchenId}/aisles/{nameKey}`, in core's schema (`packages/core/src/schema/aisle-doc.ts`,
 * decision-7's shape). It merges in a transaction, the same as mergeItem, mergeMeal and
 * mergeRecipe, so it also fails instead of queueing when made offline (same open part of D4).
 * aisleFor reads the same document directly; unlike the transactional writes, a plain read falls
 * back to the local cache when offline, so a suggestion can still be read with no connection.
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

  async mergeRecipe(kitchenId: string, recipe: Recipe): Promise<void> {
    const ref = this.#fs.doc(this.#db, 'kitchens', kitchenId, 'recipes', recipe.id);
    await this.#fs.runTransaction(this.#db, async (tx) => {
      const snapshot = await tx.get(ref);
      let merged = recipe;
      if (snapshot.exists()) {
        const stored = decodeRecipe(snapshot.data());
        if (!stored.ok) throw new Error(`invalid recipe document ${recipe.id}: ${stored.error.path} ${stored.error.message}`);
        merged = mergeRecipe(stored.value, recipe);
      }
      tx.set(ref, encodeRecipe(merged));
    });
  }

  async getRecipes(kitchenId: string): Promise<readonly Recipe[]> {
    const snapshot = await this.#fs.getDocs(this.#recipesQuery(kitchenId));
    const { recipes, problems } = decodeAllRecipes(snapshot);
    if (problems.length > 0) throw new Error(problems.join('; '));
    return recipes;
  }

  watchRecipes(
    kitchenId: string,
    onRecipes: (recipes: readonly Recipe[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return this.#fs.onSnapshot(this.#recipesQuery(kitchenId), {
      next: (snapshot) => {
        const { recipes, problems } = decodeAllRecipes(snapshot);
        for (const problem of problems) onError?.(new Error(problem));
        onRecipes(recipes);
      },
      error: (error) => onError?.(error),
    });
  }

  /**
   * Remembers `nameKey`'s aisle at `kitchens/{kitchenId}/aisles/{nameKey}` (R11, R14), in core's
   * schema. Reads, merges with core's last-write-wins rule (so a later stamp can never lose to an
   * earlier one that happens to write second) and writes inside a transaction, the same pattern
   * as mergeItem, mergeMeal and mergeRecipe. A Firestore transaction needs a connection, so this
   * rejects instead of queueing when made offline, same open part of design question D4 as the
   * other three merges; a caller must tolerate that rejection (TASK-1.22.7's AddItem does).
   */
  async rememberAisle(kitchenId: string, nameKey: string, aisle: Stamped<string>): Promise<void> {
    const ref = this.#aisleRef(kitchenId, nameKey);
    await this.#fs.runTransaction(this.#db, async (tx) => {
      const snapshot = await tx.get(ref);
      let merged = aisle;
      if (snapshot.exists()) {
        const stored = decodeAisleMemory(snapshot.data());
        if (!stored.ok) throw new Error(`invalid aisle document ${nameKey}: ${stored.error.path} ${stored.error.message}`);
        merged = mergeStamped(stored.value, aisle);
      }
      tx.set(ref, encodeAisleMemory(merged));
    });
  }

  /**
   * The aisle last remembered for `nameKey`, or null if none has been. This is a plain `getDoc`,
   * not a transaction, so it can fall back to the local cache when offline and read a suggestion
   * with no connection - but only within two limits: a `nameKey` this phone has never read online
   * has nothing cached to fall back to (the SDK rejects with "unavailable" rather than resolving
   * to a missing snapshot; that is read the same as "never remembered" and gives null), and once
   * cached, the value can still be stale after a `rememberAisle` on this phone, because a
   * transaction's write does not refresh the cache this read uses (decision-7's spike, TASK-1.16,
   * covers how quickly a stale cache catches up once the native SDK reconnects). An undecodable
   * document throws, the same `invalid aisle document {nameKey}: ...` error `rememberAisle` throws
   * for one, since this promise is the only error channel `aisleFor` has. Callers fall back to no
   * suggestion; port instrumentation logs the failure.
   */
  async aisleFor(kitchenId: string, nameKey: string): Promise<string | null> {
    let snapshot: Awaited<ReturnType<FirestoreFns['getDoc']>>;
    try {
      snapshot = await this.#fs.getDoc(this.#aisleRef(kitchenId, nameKey));
    } catch (error) {
      if (isOfflineMiss(error)) return null;
      throw error;
    }
    if (!snapshot.exists()) return null;
    const decoded = decodeAisleMemory(snapshot.data());
    if (!decoded.ok) throw new Error(`invalid aisle document ${nameKey}: ${decoded.error.path} ${decoded.error.message}`);
    return decoded.value.value;
  }

  #aisleRef(kitchenId: string, nameKey: string): unknown {
    return this.#fs.doc(this.#db, 'kitchens', kitchenId, 'aisles', nameKey);
  }

  #weekQuery(kitchenId: string, weekId: string): unknown {
    return this.#fs.query(this.#fs.collection(this.#db, 'kitchens', kitchenId, 'items'), this.#fs.where('weekId', '==', weekId));
  }

  /** Meal's stored weekId is a Stamped field (StoredField), unlike Item's plain string, so the query reads weekId.v. */
  #mealWeekQuery(kitchenId: string, weekId: string): unknown {
    return this.#fs.query(this.#fs.collection(this.#db, 'kitchens', kitchenId, 'meals'), this.#fs.where('weekId.v', '==', weekId));
  }

  /** Recipes are kitchen-wide (no weekId), so the whole collection is read with no where clause. */
  #recipesQuery(kitchenId: string): unknown {
    return this.#fs.query(this.#fs.collection(this.#db, 'kitchens', kitchenId, 'recipes'));
  }
}

/**
 * True for the error the web and native SDKs raise from a `getDoc` made while offline, for a
 * document absent from the local cache (the Firestore error code `unavailable`, `firestore/unavailable`
 * on the native module's own codes). `aisleFor` treats this the same as a missing document.
 */
function isOfflineMiss(error: unknown): boolean {
  const code = (error as { code?: unknown } | null | undefined)?.code;
  return code === 'unavailable' || code === 'firestore/unavailable';
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

function decodeAllRecipes(snapshot: QuerySnapshotLike): { recipes: Recipe[]; problems: string[] } {
  const recipes: Recipe[] = [];
  const problems: string[] = [];
  for (const doc of snapshot.docs) {
    const decoded = decodeRecipe(doc.data());
    if (decoded.ok) recipes.push(decoded.value);
    else problems.push(`invalid recipe document ${doc.id}: ${decoded.error.path} ${decoded.error.message}`);
  }
  return { recipes, problems };
}
