import { isRecipeDeleted } from '@grocs/core';
import type { Recipe } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';

/**
 * Follow a kitchen's recipes. `onRecipes` gets the live recipes (tombstones hidden) now and
 * whenever either phone changes them. Takes the SyncStore directly rather than Deps (contract
 * §8), so this query lands and commits independently of the Deps widening.
 */
export function watchKitchenRecipes(
  store: SyncStore,
  kitchenId: string,
  onRecipes: (recipes: readonly Recipe[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return store.watchRecipes(
    kitchenId,
    (recipes) => onRecipes(recipes.filter((recipe) => !isRecipeDeleted(recipe))),
    onError,
  );
}
