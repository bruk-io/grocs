// AC#1 of TASK-74.5.11: App.watchKitchenRecipes goes through the application query (not a direct
// store call), live recipes only, tombstones hidden.
import { describe, expect, it } from 'vitest';
import type { Recipe } from '@grocs/core';
import { InMemorySyncStore } from '@grocs/ports/testing';
import { appOnFakes } from '../../testing/render-route.tsx';

const KITCHEN = 'k1';

const recipe = (id: string, createdAt: number, deleted = false): Recipe => ({
  id,
  addedBy: 'u1',
  createdAt,
  sourceUrl: `https://recipe.invalid/${id}`,
  title: `Recipe ${id}`,
  yield: null,
  steps: ['Cook it.'],
  ingredients: [{ line: '1 egg', quantity: '1', unit: null, item: 'egg' }],
  image: null,
  deleted: deleted ? { at: createdAt, by: 'u1' } : null,
});

describe("composeApp's App.watchKitchenRecipes", () => {
  it("delivers the kitchen's live recipes, tombstones hidden", async () => {
    const syncStore = new InMemorySyncStore();
    await syncStore.mergeRecipe(KITCHEN, recipe('a', 1));
    await syncStore.mergeRecipe(KITCHEN, recipe('b', 2, true));
    const { app } = await appOnFakes({ signedIn: true, syncStore });

    const seen: string[][] = [];
    const stop = app.watchKitchenRecipes(KITCHEN, (recipes) => seen.push(recipes.map((r) => r.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();

    expect(seen[seen.length - 1]).toEqual(['a']);
  });
});
