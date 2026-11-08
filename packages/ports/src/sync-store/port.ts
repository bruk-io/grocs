import type { Item, Meal, Recipe } from '@grocs/core';
import type { Unsubscribe } from '../unsubscribe.ts';


/**
 * The kitchen's shared data. The store keeps the merge of every copy it has been given, using the
 * domain's rules (field-level last-write-wins, permanent deletes), so the order in which two phones
 * send their changes does not matter. Offline changes wait on the phone and arrive later (R16).
 */
export interface SyncStore {
  /** Merge this copy of an item into the store. Merging the same copy twice changes nothing. */
  mergeItem(kitchenId: string, item: Item): Promise<void>;
  /** Every item of one week, deleted ones included (they are tombstones). */
  getItems(kitchenId: string, weekId: string): Promise<readonly Item[]>;
  /**
   * Call `onItems` with the week's items soon after subscribing, and again whenever they change,
   * on this phone or the other. Returns a function that stops the calls.
   */
  watchItems(
    kitchenId: string,
    weekId: string,
    onItems: (items: readonly Item[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe;
  /** Merge this copy of a meal into the store. Merging the same copy twice changes nothing. */
  mergeMeal(kitchenId: string, meal: Meal): Promise<void>;
  /** Every meal of one week, deleted ones included (they are tombstones). */
  getMeals(kitchenId: string, weekId: string): Promise<readonly Meal[]>;
  /**
   * Call `onMeals` with the week's meals soon after subscribing, and again whenever they change,
   * on this phone or the other. Returns a function that stops the calls.
   */
  watchMeals(
    kitchenId: string,
    weekId: string,
    onMeals: (meals: readonly Meal[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe;
  /** Merge this copy of a kitchen recipe. Merging the same copy twice changes nothing; a delete is never undone. */
  mergeRecipe(kitchenId: string, recipe: Recipe): Promise<void>;
  /** Every recipe of the kitchen (any week), deleted ones included (they are tombstones). */
  getRecipes(kitchenId: string): Promise<readonly Recipe[]>;
  /**
   * Call `onRecipes` with the kitchen's recipes (tombstones included) soon after subscribing, and
   * again whenever they change, on this phone or the other. Returns a function that stops the calls.
   */
  watchRecipes(
    kitchenId: string,
    onRecipes: (recipes: readonly Recipe[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe;
}
