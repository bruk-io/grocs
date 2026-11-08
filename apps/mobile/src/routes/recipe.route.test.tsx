// Level 4 of decision-11 for the recipe route (TASK-74.5 AC#4, contract §17): the real route shows
// a meal's saved recipe entirely from local data (watchKitchenRecipes, recipeForLink), never by
// calling the server - the FakeRecipeImporter returned by appOnFakes stays untouched.
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMeal, weekIdFor } from '@grocs/core';
import type { Recipe } from '@grocs/core';
import { FakeKitchenGateway, InMemorySyncStore } from '@grocs/ports/testing';
import Recipe_ from '../../app/recipe.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

const ROUTES = { recipe: Recipe_ };

const SOURCE_URL = 'https://recipe.invalid/chana-masala';

const savedRecipe = (id: string): Recipe => ({
  id,
  addedBy: 'u1',
  createdAt: 1,
  sourceUrl: SOURCE_URL,
  title: 'Chana masala',
  yield: '4 servings',
  steps: ['Heat the oil.', 'Add the chickpeas.'],
  ingredients: [
    { line: '1 1/2 cups chickpeas', quantity: '1 1/2', unit: 'cups', item: 'chickpeas' },
    { line: '1 tsp cumin', quantity: '1', unit: 'tsp', item: 'cumin' },
  ],
  image: null,
  deleted: null,
});

describe('the recipe route (TASK-74.5.14)', () => {
  it("shows a meal's saved recipe without calling the server", async () => {
    const syncStore = new InMemorySyncStore();
    const kitchens = new FakeKitchenGateway('u1');
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens });
    const weekId = weekIdFor(app.app.now());
    const made = createMeal({ id: 'm1', weekId, dayIndex: 0, name: 'Chana masala night', link: SOURCE_URL }, { at: app.app.now(), by: 'u1' });
    if (!made.ok) throw new Error('fixture meal is invalid');
    await syncStore.mergeMeal(kitchenId, made.value);
    await syncStore.mergeRecipe(kitchenId, savedRecipe('r1'));

    renderRoute(ROUTES, { app, location: '/recipe?dayId=2026-10-19&mealId=m1' });

    expect(await screen.findByText('Chana masala')).toBeTruthy();
    expect(screen.getByText('1 1/2 cups chickpeas')).toBeTruthy();
    expect(screen.getByText('1 tsp cumin')).toBeTruthy();
    expect(screen.getByText('1. Heat the oil.')).toBeTruthy();
    expect(screen.getByText('2. Add the chickpeas.')).toBeTruthy();
    expect(app.recipeImporter.calls).toEqual([]);
  });

  it('shows an empty state for a meal with no matching recipe', async () => {
    const syncStore = new InMemorySyncStore();
    const kitchens = new FakeKitchenGateway('u1');
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens });
    const weekId = weekIdFor(app.app.now());
    const made = createMeal({ id: 'm1', weekId, dayIndex: 0, name: 'Taco night' }, { at: app.app.now(), by: 'u1' });
    if (!made.ok) throw new Error('fixture meal is invalid');
    await syncStore.mergeMeal(kitchenId, made.value);

    renderRoute(ROUTES, { app, location: '/recipe?dayId=2026-10-19&mealId=m1' });

    expect(await screen.findByText('No recipe is saved for this meal yet.')).toBeTruthy();
    expect(app.recipeImporter.calls).toEqual([]);
  });
});
