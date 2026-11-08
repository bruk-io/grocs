import {
  decodeItem,
  decodeMeal,
  decodeRecipe,
  encodeItem,
  encodeMeal,
  encodeRecipe,
  mergeItem,
  mergeMeal,
  mergeRecipe,
  mergeStamped,
  stamped,
} from '@grocs/core';
import type { Item, Meal, Recipe, Stamped } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';
import type { FirestoreFns, QuerySnapshotLike } from './sdk.ts';

/**
 * The schema version of the aisle-memory document (decision-7, still proposed, is the one shape
 * this slice adopts). No codec for it lives in core (unlike items, meals and recipes): the shape
 * is one stamped field, so the translation stays here rather than adding a one-field schema
 * module for a document whose home may move once decision-7 lands.
 */
const AISLE_MEMORY_SCHEMA_VERSION = 1;

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
 * rememberAisle and aisleFor keep the aisle-suggestion memory (R11, R14) at
 * `kitchens/{kitchenId}/aisles/{nameKey}`, in decision-7's shape. They read and write plain
 * documents rather than a transaction, by design: decision-7 found transactions fail offline.
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
   * Remembers `nameKey`'s aisle at `kitchens/{kitchenId}/aisles/{nameKey}` (decision-7's shape,
   * R11, R14). No transaction: a transaction needs a connection and would fail offline (decision-7),
   * so this reads, merges with core's last-write-wins rule and writes a plain document instead.
   * `setDoc` resolves only once the write reaches the server, so this still awaits the round trip
   * when online; offline it applies to the local cache and queues, same as `getDoc`/`setDoc`
   * elsewhere in this file.
   */
  async rememberAisle(kitchenId: string, nameKey: string, aisle: Stamped<string>): Promise<void> {
    const ref = this.#aisleRef(kitchenId, nameKey);
    const snapshot = await this.#fs.getDoc(ref);
    let merged = aisle;
    if (snapshot.exists()) {
      const stored = decodeAisleMemory(snapshot.data());
      if (stored) merged = mergeStamped(stored, aisle);
    }
    await this.#fs.setDoc(ref, encodeAisleMemory(merged));
  }

  /**
   * The aisle last remembered for `nameKey`, or null if none has been. `getDoc` falls back to the
   * local cache when offline, which is what lets this work offline (decision-7's spike, TASK-1.16,
   * covers how quickly a stale cache catches up once the native SDK reconnects).
   */
  async aisleFor(kitchenId: string, nameKey: string): Promise<string | null> {
    const snapshot = await this.#fs.getDoc(this.#aisleRef(kitchenId, nameKey));
    if (!snapshot.exists()) return null;
    return decodeAisleMemory(snapshot.data())?.value ?? null;
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

/** `{schemaVersion, aisle: {v, at, by}}` (decision-7). Not core's StoredField shape by name, same fields. */
function encodeAisleMemory(aisle: Stamped<string>): unknown {
  return {
    schemaVersion: AISLE_MEMORY_SCHEMA_VERSION,
    aisle: { v: aisle.value, at: aisle.stamp.at, by: aisle.stamp.by },
  };
}

/** Returns null for a document that is missing, of a different schema version, or malformed, so a bad read is never mistaken for "never remembered". */
function decodeAisleMemory(raw: unknown): Stamped<string> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Record<string, unknown>;
  if (data['schemaVersion'] !== AISLE_MEMORY_SCHEMA_VERSION) return null;
  const aisle = data['aisle'];
  if (typeof aisle !== 'object' || aisle === null) return null;
  const { v, at, by } = aisle as Record<string, unknown>;
  if (typeof v !== 'string' || typeof at !== 'number' || typeof by !== 'string') return null;
  return stamped(v, { at, by });
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
