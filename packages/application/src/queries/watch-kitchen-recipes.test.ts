import { InMemorySyncStore } from '@grocs/ports/testing';
import type { Recipe } from '@grocs/core';
import type { SyncStore, Unsubscribe } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { watchKitchenRecipes } from './watch-kitchen-recipes.ts';

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

describe('watchKitchenRecipes', () => {
  it("calls onRecipes with the kitchen's live recipes, tombstones hidden", async () => {
    const store = new InMemorySyncStore();
    await store.mergeRecipe(KITCHEN, recipe('a', 1));
    await store.mergeRecipe(KITCHEN, recipe('b', 2, true));

    const seen: string[][] = [];
    const stop = watchKitchenRecipes(store, KITCHEN, (recipes) => seen.push(recipes.map((r) => r.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();

    expect(seen[seen.length - 1]).toEqual(['a']);
  });

  it('calls onRecipes soon after subscribing even with no recipes yet', async () => {
    const store = new InMemorySyncStore();
    const seen: string[][] = [];
    const stop = watchKitchenRecipes(store, KITCHEN, (recipes) => seen.push(recipes.map((r) => r.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen).toEqual([[]]);
  });

  it('passes errors through to onError', () => {
    const boom = new Error('boom');
    const notUsed = (): never => {
      throw new Error('not used by this test');
    };
    let capturedOnError: ((error: Error) => void) | undefined;
    const store: SyncStore = {
      mergeItem: notUsed,
      getItems: notUsed,
      watchItems: notUsed,
      mergeMeal: notUsed,
      getMeals: notUsed,
      watchMeals: notUsed,
      mergeRecipe: notUsed,
      rememberAisle: notUsed,
      aisleFor: notUsed,
      getRecipes: notUsed,
      watchRecipes: (_kitchenId, _onRecipes, onError): Unsubscribe => {
        capturedOnError = onError;
        return () => {};
      },
    };

    const errors: Error[] = [];
    watchKitchenRecipes(store, KITCHEN, () => {}, (error) => errors.push(error));
    capturedOnError?.(boom);

    expect(errors).toEqual([boom]);
  });

  it('stops delivering recipes once unsubscribed', async () => {
    const store = new InMemorySyncStore();
    await store.mergeRecipe(KITCHEN, recipe('a', 1));

    const seen: string[][] = [];
    const stop = watchKitchenRecipes(store, KITCHEN, (recipes) => seen.push(recipes.map((r) => r.id)));
    await new Promise((r) => setTimeout(r, 10));
    const callsBeforeStop = seen.length;
    stop();

    await store.mergeRecipe(KITCHEN, recipe('b', 2));
    await new Promise((r) => setTimeout(r, 10));

    expect(seen.length).toBe(callsBeforeStop);
  });
});
