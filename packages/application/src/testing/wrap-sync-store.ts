import type { SyncStore } from '@grocs/ports';

/** A SyncStore that delegates every method to `store`, except the ones overridden. */
export function wrapSyncStore(store: SyncStore, overrides: Partial<SyncStore>): SyncStore {
  return {
    mergeItem: (...a) => store.mergeItem(...a),
    getItems: (...a) => store.getItems(...a),
    watchItems: (...a) => store.watchItems(...a),
    mergeMeal: (...a) => store.mergeMeal(...a),
    getMeals: (...a) => store.getMeals(...a),
    watchMeals: (...a) => store.watchMeals(...a),
    mergeRecipe: (...a) => store.mergeRecipe(...a),
    getRecipes: (...a) => store.getRecipes(...a),
    watchRecipes: (...a) => store.watchRecipes(...a),
    rememberAisle: (...a) => store.rememberAisle(...a),
    aisleFor: (...a) => store.aisleFor(...a),
    ...overrides,
  };
}
