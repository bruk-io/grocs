import { recipeForLink, recipeFromImport } from '@grocs/core';
import type { ParsedRecipe, Recipe, RecipeImportError } from '@grocs/core';
import { FakeClock, FakeRecipeImporter, InMemorySyncStore } from '@grocs/ports/testing';
import type { RecipeImporter, SyncStore } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import type { MealAdded } from './add-meal.ts';
import { createTestClient } from '../testing/client.ts';
import type { TestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const URL = 'https://recipe.invalid/tacos';

const parsedRecipe = (overrides: Partial<ParsedRecipe> = {}): ParsedRecipe => ({
  recipeId: 'r1',
  sourceUrl: URL,
  title: 'Tacos',
  yield: '4 servings',
  steps: ['Warm the tortillas.'],
  ingredients: [
    { line: '1 cup rice', quantity: '1', unit: 'cup', item: 'rice' },
    { line: 'A pinch of salt', quantity: null, unit: null, item: null },
  ],
  image: null,
  ...overrides,
});

const importCmd = (mealId: string, url = URL) => ({ type: 'ImportRecipe' as const, kitchenId: KITCHEN, weekId: WEEK, mealId, url });
const addMealCmd = () => ({ type: 'AddMeal' as const, kitchenId: KITCHEN, weekId: WEEK, dayIndex: 0, name: 'Tacos night' });
const editMealCmd = (mealId: string, link: string | null) => ({ type: 'EditMeal' as const, kitchenId: KITCHEN, weekId: WEEK, mealId, name: 'Tacos night', link });
const removeMealCmd = (mealId: string) => ({ type: 'RemoveMeal' as const, kitchenId: KITCHEN, weekId: WEEK, mealId });

interface ClientOptions {
  readonly store?: SyncStore;
  readonly recipeImporter?: RecipeImporter;
  readonly clock?: FakeClock;
}

/** A client with a meal already on the week's plan, ready to import onto. */
async function clientWithMeal(uid: string, options: ClientOptions = {}): Promise<{ client: TestClient; mealId: string }> {
  const client = await createTestClient({ uid, ...options });
  const added = await client.dispatcher.dispatch(addMealCmd());
  const event = added.ok ? added.value[0] : undefined;
  const mealId = event?.type === 'MealAdded' ? (event as MealAdded).mealId : '';
  if (!mealId) throw new Error('meal was not added');
  // A later stamp than the meal's own creation, so the relink's field-level merge (R18) picks
  // the import's link by stamp rather than falling to the JSON tie-break on an equal instant.
  client.clock.advance(1);
  return { client, mealId };
}

/** A store that queues mergeMeal and mergeRecipe until goOnline runs them against shared, standing in for an offline phone (R16, R47). */
function offlineStore(shared: SyncStore): { store: SyncStore; goOnline: () => Promise<void> } {
  let online = false;
  const queue: Array<() => Promise<void>> = [];
  const store: SyncStore = {
    mergeItem: (k, item) => shared.mergeItem(k, item),
    getItems: (k, w) => shared.getItems(k, w),
    watchItems: (k, w, cb, onError) => shared.watchItems(k, w, cb, onError),
    mergeMeal: async (k, meal) => {
      if (online) await shared.mergeMeal(k, meal);
      else queue.push(() => shared.mergeMeal(k, meal));
    },
    getMeals: (k, w) => shared.getMeals(k, w),
    watchMeals: (k, w, cb, onError) => shared.watchMeals(k, w, cb, onError),
    mergeRecipe: async (k, recipe) => {
      if (online) await shared.mergeRecipe(k, recipe);
      else queue.push(() => shared.mergeRecipe(k, recipe));
    },
    getRecipes: (k) => shared.getRecipes(k),
    watchRecipes: (k, cb, onError) => shared.watchRecipes(k, cb, onError),
  };
  return {
    store,
    goOnline: async () => {
      online = true;
      for (const op of queue) await op();
      queue.length = 0;
    },
  };
}

describe('ImportRecipe scenarios (contract TASK-74 §8, R47)', () => {
  it('imports, saves the kitchen recipe, relinks the meal and returns one grocery line per ingredient', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });

    const result = await client.dispatcher.dispatch(importCmd(mealId));

    expect(result.ok && result.value).toEqual([
      {
        type: 'RecipeImported',
        recipeId: 'r1',
        mealId,
        weekId: WEEK,
        sourceUrl: URL,
        groceries: [
          { name: 'rice', amount: '1 cup' },
          { name: 'A pinch of salt', amount: null },
        ],
      },
    ]);
    const recipes = await client.store.getRecipes(KITCHEN);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.id).toBe('r1');
    expect(recipes[0]?.deleted).toBeNull();
    const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    expect(meal?.link.value).toBe(URL);
  });

  it.each<RecipeImportError>(['invalid-url', 'not-found', 'blocked', 'unreachable', 'not-a-recipe', 'incomplete-recipe'])(
    'maps a %s import error to that code, storing no recipe and relinking nothing',
    async (code) => {
      const importer = new FakeRecipeImporter([[URL, code]]);
      const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });

      const result = await client.dispatcher.dispatch(importCmd(mealId));

      expect(result).toEqual({ ok: false, error: { code, message: expect.any(String) } });
      expect(await client.store.getRecipes(KITCHEN)).toEqual([]);
      const [meal] = await client.store.getMeals(KITCHEN, WEEK);
      expect(meal?.link.value).toBeNull();
    },
  );

  it('refuses a recipe whose kitchen copy is a tombstone, storing nothing and leaving the meal unrelinked (§0.6)', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });
    const tombstone: Recipe = { ...recipeFromImport(parsedRecipe(), { at: 1, by: 'alex' }), deleted: { at: 2, by: 'alex' } };
    await client.store.mergeRecipe(KITCHEN, tombstone);

    const result = await client.dispatcher.dispatch(importCmd(mealId));

    expect(result).toEqual({ ok: false, error: { code: 'recipe-deleted', message: expect.any(String) } });
    const [recipe] = await client.store.getRecipes(KITCHEN);
    expect(recipe?.deleted).not.toBeNull();
    const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    expect(meal?.link.value).toBeNull();
  });

  it('turns an impossible relink (a non-http(s) sourceUrl) into internal, storing nothing', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe({ sourceUrl: 'ftp://x' })]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });

    const result = await client.dispatcher.dispatch(importCmd(mealId));

    expect(result).toEqual({ ok: false, error: { code: 'internal', message: expect.any(String) } });
    expect(await client.store.getRecipes(KITCHEN)).toEqual([]);
    const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    expect(meal?.link.value).toBeNull();
  });

  it('needs a signed-in member and never calls the importer', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const client = await createTestClient({ uid: 'alex', signedIn: false, recipeImporter: importer });

    const result = await client.dispatcher.dispatch(importCmd('m1'));

    expect(!result.ok && result.error.code).toBe('not-signed-in');
    expect(importer.calls).toEqual([]);
  });

  it('refuses an unknown meal without calling the importer', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const client = await createTestClient({ uid: 'alex', recipeImporter: importer });

    const result = await client.dispatcher.dispatch(importCmd('no-such-meal'));

    expect(!result.ok && result.error.code).toBe('meal-not-found');
    expect(importer.calls).toEqual([]);
  });

  it('refuses a meal removed on this device without calling the importer (§8 step 2: only a live meal)', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });
    await client.dispatcher.dispatch(removeMealCmd(mealId));

    const result = await client.dispatcher.dispatch(importCmd(mealId));

    expect(!result.ok && result.error.code).toBe('meal-not-found');
    expect(importer.calls).toEqual([]);
    expect(await client.store.getRecipes(KITCHEN)).toEqual([]);
  });

  it('turns a throwing importer into an internal error result, logged', async () => {
    const throwing: RecipeImporter = { importRecipe: () => Promise.reject(new Error('network is down')) };
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: throwing });

    const result = await client.dispatcher.dispatch(importCmd(mealId));

    expect(!result.ok && result.error.code).toBe('internal');
    const failed = client.logger.records().find((r) => r.attributes['method'] === 'importRecipe' && r.attributes['outcome'] === 'error');
    expect(failed?.severity).toBe('error');
  });

  it('reaches the importer only through the instrumented port (R28, R31)', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });

    await client.dispatcher.dispatch(importCmd(mealId));

    const call = client.logger.records().find((r) => r.attributes['method'] === 'importRecipe' && r.attributes['outcome'] === 'ok');
    expect(call?.attributes).toMatchObject({ port: 'recipeImporter', method: 'importRecipe', outcome: 'ok' });
  });

  it('never writes the recipe title, URL, ingredient or step text to a log record (R36)', async () => {
    const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
    const { client, mealId } = await clientWithMeal('alex', { recipeImporter: importer });

    await client.dispatcher.dispatch(importCmd(mealId));

    const text = JSON.stringify(client.logger.records());
    expect(text).not.toContain('Tacos');
    expect(text).not.toContain(URL);
    expect(text).not.toContain('rice');
    expect(text).not.toContain('Warm the tortillas');
  });

  it('relink must win over a meal save stamped in the same millisecond (TASK-74.5.17 repro)', async () => {
    const rawUrl = 'https://recipe.invalid/a?utm_source=ig';
    const normalisedUrl = 'https://recipe.invalid/a';
    const clock = new FakeClock(5_000);
    const importer = new FakeRecipeImporter([[rawUrl, parsedRecipe({ sourceUrl: normalisedUrl })]]);
    const client = await createTestClient({ uid: 'alex', recipeImporter: importer, clock });

    // AddMeal with the raw link, on a clock that will not advance
    const addCmd = { type: 'AddMeal' as const, kitchenId: KITCHEN, weekId: WEEK, dayIndex: 0, name: 'Tacos night', link: rawUrl };
    const added = await client.dispatcher.dispatch(addCmd);
    const event = added.ok ? added.value[0] : undefined;
    const mealId = event?.type === 'MealAdded' ? (event as MealAdded).mealId : '';
    if (!mealId) throw new Error('meal was not added');

    // ImportRecipe on the same clock instant; without the fix, the raw link's JSON order wins
    const result = await client.dispatcher.dispatch(importCmd(mealId, rawUrl));

    expect(result.ok).toBe(true);
    const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    expect(meal?.link.value).toBe(normalisedUrl);
  });

  describe('two members (R47)', () => {
    it('importing the same URL from both clients leaves one recipe with the earlier createdAt', async () => {
      const shared = new InMemorySyncStore();
      const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
      const { client: alex, mealId } = await clientWithMeal('alex', { store: shared, recipeImporter: importer, clock: new FakeClock(1_000) });
      const sam = await createTestClient({ uid: 'sam', store: shared, recipeImporter: importer, clock: new FakeClock(2_000) });

      await sam.dispatcher.dispatch(importCmd(mealId));
      await alex.dispatcher.dispatch(importCmd(mealId));

      const recipes = await shared.getRecipes(KITCHEN);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.createdAt).toBe(1_001);
      expect(recipes[0]?.addedBy).toBe('alex');
    });

    it.each([
      { bAt: 2_050, winner: 'alex' as const },
      { bAt: 3_000, winner: 'sam' as const },
    ])('an offline relink stamped $bAt merges against A\'s import by stamp, not arrival order', async ({ bAt, winner }) => {
      const shared = new InMemorySyncStore();
      const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
      const { client: alex, mealId } = await clientWithMeal('alex', { store: shared, recipeImporter: importer, clock: new FakeClock(2_000) });
      // Widen the gap between the meal's own creation stamp and alex's import, so a bAt
      // between them (2_050) isolates the import-vs-relink race instead of also losing to
      // the meal's creation stamp.
      alex.clock.advance(99);

      const { store: samStore, goOnline } = offlineStore(shared);
      const sam = await createTestClient({ uid: 'sam', store: samStore, clock: new FakeClock(bAt) });
      await sam.dispatcher.dispatch(editMealCmd(mealId, 'https://example.com/other'));

      await alex.dispatcher.dispatch(importCmd(mealId));
      await goOnline();

      const [meal] = await shared.getMeals(KITCHEN, WEEK);
      const recipes = await shared.getRecipes(KITCHEN);
      expect(recipes).toHaveLength(1);
      if (winner === 'alex') {
        expect(meal?.link.value).toBe(URL);
        expect(recipeForLink(recipes, meal!.link.value)?.id).toBe(recipes[0]?.id);
      } else {
        expect(meal?.link.value).toBe('https://example.com/other');
        expect(recipeForLink(recipes, meal!.link.value)).toBeNull();
      }
    });

    it('a concurrent remove beats an import: the meal stays deleted and the recipe still saves (R20)', async () => {
      const shared = new InMemorySyncStore();
      const importer = new FakeRecipeImporter([[URL, parsedRecipe()]]);
      const { client: alex, mealId } = await clientWithMeal('alex', { store: shared, recipeImporter: importer, clock: new FakeClock(2_000) });

      const { store: samStore, goOnline } = offlineStore(shared);
      const sam = await createTestClient({ uid: 'sam', store: samStore, clock: new FakeClock(1_000) });
      await sam.dispatcher.dispatch(removeMealCmd(mealId));

      const result = await alex.dispatcher.dispatch(importCmd(mealId));
      await goOnline();

      expect(result.ok).toBe(true);
      const [meal] = await shared.getMeals(KITCHEN, WEEK);
      expect(meal?.deleted).not.toBeNull();
      const recipes = await shared.getRecipes(KITCHEN);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.deleted).toBeNull();
    });
  });
});
