// Level 4 of decision-11 for the import flow (TASK-74.5.15, contract §17): the real AddMeal route,
// dispatching AddMeal/EditMeal, ImportRecipe and one AddItem per ingredient in the order §17 lays
// out, and the Recipe route it lands on.
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMeal, weekIdFor } from '@grocs/core';
import type { ParsedRecipe, Recipe, RecipeImportError } from '@grocs/core';
import { FakeClock, FakeKitchenGateway, FakeRecipeImporter, InMemorySyncStore } from '@grocs/ports/testing';
import type { RecipeImportOutcome } from '@grocs/ports/testing';
import AddMeal from '../../app/add-meal.tsx';
import Plan from '../../app/plan.tsx';
import Recipe_ from '../../app/recipe.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

const ROUTES = { plan: Plan, 'add-meal': AddMeal, recipe: Recipe_ };
const DAY_ID = '2026-10-19'; // Monday of the fixed "This week" the other route tests use

const nameField = () => screen.getByRole('textbox', { name: 'What are you making?' });
const linkField = () => screen.getByRole('textbox', { name: 'Recipe link (optional)' });
const getRecipeButton = () => screen.getByRole('button', { name: 'Get recipe and groceries' });

function parsedRecipe(overrides: Partial<ParsedRecipe> = {}): ParsedRecipe {
  return {
    recipeId: 'r1',
    sourceUrl: 'https://recipe.invalid/chana-masala',
    title: 'Chana masala',
    yield: '4 servings',
    steps: ['Heat the oil.', 'Add the chickpeas.'],
    ingredients: [
      { line: '1 cup chickpeas', quantity: '1', unit: 'cup', item: 'chickpeas' },
      { line: '2 tsp cumin', quantity: '2', unit: 'tsp', item: 'cumin' },
    ],
    image: null,
    ...overrides,
  };
}

function savedRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'r1',
    addedBy: 'u1',
    createdAt: 1,
    sourceUrl: 'https://recipe.invalid/chana-masala',
    title: 'Chana masala',
    yield: '4 servings',
    steps: ['Heat the oil.'],
    ingredients: [{ line: '1 cup chickpeas', quantity: '1', unit: 'cup', item: 'chickpeas' }],
    image: null,
    deleted: null,
    ...overrides,
  };
}

async function openNewMeal(entries: ReadonlyArray<readonly [string, RecipeImportOutcome]> = []) {
  const syncStore = new InMemorySyncStore();
  const kitchens = new FakeKitchenGateway('u1');
  const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
  const recipeImporter = new FakeRecipeImporter(entries);
  const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, recipeImporter, clock: new FakeClock() });
  const weekId = weekIdFor(app.app.now());
  renderRoute(ROUTES, { app, location: `/add-meal?dayId=${DAY_ID}` });
  await screen.findByText('Add a meal');
  return { app, syncStore, kitchenId, weekId, recipeImporter };
}

async function openEditMeal(mealId: string, meal: { name: string; link?: string }, entries: ReadonlyArray<readonly [string, RecipeImportOutcome]> = [], recipes: readonly Recipe[] = []) {
  const syncStore = new InMemorySyncStore();
  const kitchens = new FakeKitchenGateway('u1');
  const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
  const recipeImporter = new FakeRecipeImporter(entries);
  const clock = new FakeClock();
  const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, recipeImporter, clock });
  const weekId = weekIdFor(app.app.now());
  const made = createMeal({ id: mealId, weekId, dayIndex: 0, ...meal }, { at: app.app.now(), by: 'u1' });
  if (!made.ok) throw new Error('fixture meal is invalid');
  await syncStore.mergeMeal(kitchenId, made.value);
  for (const recipe of recipes) await syncStore.mergeRecipe(kitchenId, recipe);
  clock.advance(60_000); // the fixture was planned a minute ago, so the route's own writes are later (matches meal-plan.route.test.tsx)
  renderRoute(ROUTES, { app, location: `/add-meal?dayId=${DAY_ID}&mealId=${mealId}` });
  await screen.findByText('Edit a meal');
  // Waits for the meal's data to have arrived and prefilled the form (a race against
  // watchWeekMeals's queued delivery - see meal-plan.route.test.tsx's EditMeal case), so a test's
  // own edits right after this helper returns are never clobbered by the prefill effect.
  await waitFor(() => expect((nameField() as HTMLInputElement).value).toBe(meal.name));
  return { app, syncStore, kitchenId, weekId, recipeImporter };
}

describe('AddMealScreen imports a pasted recipe link (TASK-74.5.15)', () => {
  it('on a new meal, leaves the recipe and one item per ingredient, and shows the recipe route (AC#1)', async () => {
    const typedLink = 'https://recipe.invalid/chana-masala?utm_source=ig';
    const { syncStore, kitchenId, weekId } = await openNewMeal([[typedLink, parsedRecipe()]]);

    fireEvent.change(nameField(), { target: { value: 'Chana masala night' } });
    fireEvent.change(linkField(), { target: { value: typedLink } });
    fireEvent.click(getRecipeButton());

    expect(await screen.findByText('Chana masala')).toBeTruthy();
    expect(screen.getByText('1 cup chickpeas')).toBeTruthy();
    expect(screen.getByText('2 tsp cumin')).toBeTruthy();

    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
    const meal = meals[0]!;
    expect(meal.link.value).toBe('https://recipe.invalid/chana-masala');

    const recipes = await syncStore.getRecipes(kitchenId);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.id).toBe('r1');
    expect(recipes[0]?.sourceUrl).toBe('https://recipe.invalid/chana-masala');

    const items = await syncStore.getItems(kitchenId, weekId);
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.badges.includes(meal.id))).toBe(true);
    expect(items.map((item) => [item.name.value, item.amount.value])).toEqual([
      ['chickpeas', '1 cup'],
      ['cumin', '2 tsp'],
    ]);
  });

  it('keeps meal.link equal to the recipe sourceUrl after going back and tapping Save, and still shows View recipe (AC#2)', async () => {
    const sourceUrl = 'https://recipe.invalid/chana-masala';
    // Typed with tracking parameters, so a Save that wrote the raw typed link back (instead of
    // the import's normalised sourceUrl) would be caught by the assertions below, both at the
    // remount and after Save.
    const typedLink = `${sourceUrl}?utm_source=ig`;
    const { app, syncStore, kitchenId, weekId } = await openEditMeal('m1', { name: 'Chana masala night' }, [[typedLink, parsedRecipe({ sourceUrl })]]);

    fireEvent.change(linkField(), { target: { value: typedLink } });
    fireEvent.click(getRecipeButton());
    await screen.findByText('Chana masala');
    cleanup();

    // Going back to the meal form is a fresh mount of the same route, as a real back navigation would be.
    renderRoute(ROUTES, { app, location: `/add-meal?dayId=${DAY_ID}&mealId=m1` });
    await screen.findByText('Edit a meal');
    expect(await screen.findByText('Saved recipe: Chana masala')).toBeTruthy();
    expect((linkField() as HTMLInputElement).value).toBe(sourceUrl);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('This week');
    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
    expect(meals[0]?.link.value).toBe(sourceUrl);
  });

  it('leaves exactly one meal after a failed import followed by a successful retry (AC#3)', async () => {
    const goodUrl = 'https://recipe.invalid/chana-masala';
    const { syncStore, kitchenId, weekId } = await openNewMeal([[goodUrl, parsedRecipe()]]);

    fireEvent.change(nameField(), { target: { value: 'Chana masala night' } });
    fireEvent.change(linkField(), { target: { value: 'https://recipe.invalid/not-seeded' } });
    fireEvent.click(getRecipeButton());
    await screen.findByText("We couldn't find a recipe on that page.");

    fireEvent.change(linkField(), { target: { value: goodUrl } });
    fireEvent.click(getRecipeButton());
    await screen.findByText('Chana masala');

    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
  });

  it('leaves exactly one meal when Save is tapped while an import is still in flight on a new meal (§17 step 2)', async () => {
    const goodUrl = 'https://recipe.invalid/chana-masala';
    const { syncStore, kitchenId, weekId } = await openNewMeal([[goodUrl, parsedRecipe()]]);

    fireEvent.change(nameField(), { target: { value: 'Chana masala night' } });
    fireEvent.change(linkField(), { target: { value: goodUrl } });
    fireEvent.click(getRecipeButton());
    // importRecipe() sets `importing` synchronously, before its first await (the AddMeal
    // dispatch); at this point in the same tick the import is still unresolved.
    fireEvent.click(screen.getByRole('button', { name: 'Add to Monday' }));

    await screen.findByText('Chana masala');

    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
  });

  const ERROR_TABLE: ReadonlyArray<readonly [RecipeImportError | 'recipe-deleted', string]> = [
    ['invalid-url', "That doesn't look like a web link."],
    ['not-found', "That page doesn't exist any more."],
    ['blocked', "That site needs a login or blocked us, so we can't read it."],
    ['unreachable', "We couldn't reach that site. Try again tomorrow."],
    ['not-a-recipe', "We couldn't find a recipe on that page."],
    ['incomplete-recipe', 'That recipe is missing its ingredients or steps.'],
    ['recipe-deleted', 'That recipe was removed from this kitchen.'],
  ];

  it.each(ERROR_TABLE)('shows the §17 message for %s, and leaves no recipe, no items, and no link change from the import (AC#4)', async (code, message) => {
    const badUrl = `https://recipe.invalid/${code}`;
    // recipe-deleted is produced by ImportRecipe finding a tombstone for the deterministic
    // recipeId (decision-3 §0.6), not by the importer, so the importer succeeds there and a
    // pre-seeded tombstone is what makes the command return the error. Typed with a tracking
    // parameter so the parsed sourceUrl differs from what was typed: a wrongful relink (or a
    // tombstone wrongly overwritten with the parsed recipe's content) would otherwise be
    // invisible to the assertions below.
    const typedUrl = code === 'recipe-deleted' ? `${badUrl}?utm_source=ig` : badUrl;
    const entries: ReadonlyArray<readonly [string, RecipeImportOutcome]> =
      code === 'recipe-deleted' ? [[typedUrl, parsedRecipe({ recipeId: 'deleted-1', sourceUrl: badUrl, title: 'Hijacked title' })]] : [[badUrl, code]];
    const recipes = code === 'recipe-deleted' ? [savedRecipe({ id: 'deleted-1', sourceUrl: badUrl, deleted: { at: 2, by: 'u1' } })] : [];
    const { syncStore, kitchenId, weekId } = await openEditMeal('m1', { name: 'Taco night' }, entries, recipes);

    fireEvent.change(linkField(), { target: { value: typedUrl } });
    fireEvent.click(getRecipeButton());

    expect(await screen.findByText(message)).toBeTruthy();
    const recipesAfter = await syncStore.getRecipes(kitchenId);
    expect(recipesAfter).toHaveLength(code === 'recipe-deleted' ? 1 : 0);
    if (code === 'recipe-deleted') {
      // Still the original tombstone: not cleared, and not overwritten with the parsed recipe's content.
      expect(recipesAfter[0]?.deleted).not.toBeNull();
      expect(recipesAfter[0]?.title).toBe('Chana masala');
    }
    expect(await syncStore.getItems(kitchenId, weekId)).toHaveLength(0);
    const meals = await syncStore.getMeals(kitchenId, weekId);
    // The EditMeal dispatched ahead of ImportRecipe (§17 step 3) already set the link to what was
    // typed; the import itself, having failed, changed nothing further.
    expect(meals[0]?.link.value).toBe(typedUrl);
  });

  it('shows the invalid-link message under the link field, not the generic banner, for a non-http pasted link (new meal)', async () => {
    const { recipeImporter } = await openNewMeal();
    fireEvent.change(nameField(), { target: { value: 'Chana masala night' } });
    fireEvent.change(linkField(), { target: { value: 'not a url' } });
    fireEvent.click(getRecipeButton());

    expect(await screen.findByText('the meal link is not a valid http or https URL')).toBeTruthy();
    expect(screen.queryByText('Could not add that meal')).toBeNull();
    expect(recipeImporter.calls).toEqual([]);
  });

  it('shows the empty-name message and makes no importer call for a blank name (AC#5)', async () => {
    const { recipeImporter } = await openNewMeal();
    fireEvent.change(linkField(), { target: { value: 'https://recipe.invalid/chana-masala' } });
    fireEvent.click(getRecipeButton());

    expect(await screen.findByText('Type what you’re making first')).toBeTruthy();
    expect(recipeImporter.calls).toEqual([]);
  });

  it('shows View recipe and navigates to it with no importer call, for a meal whose link matches a saved recipe (AC#5)', async () => {
    const sourceUrl = 'https://recipe.invalid/chana-masala';
    const { recipeImporter } = await openEditMeal('m1', { name: 'Chana masala night', link: sourceUrl }, [], [savedRecipe({ sourceUrl })]);

    expect(await screen.findByText('Saved recipe: Chana masala')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View recipe' }));

    expect(await screen.findByText('1 cup chickpeas')).toBeTruthy();
    expect(recipeImporter.calls).toEqual([]);
  });

  it('stops the AddItem fan-out and shows the other message when an ingredient yields no item (AC#6, known behaviour)', async () => {
    const url = 'https://recipe.invalid/blank-ingredient';
    const recipe = parsedRecipe({
      ingredients: [
        { line: '1 cup chickpeas', quantity: '1', unit: 'cup', item: 'chickpeas' },
        // A blank line: groceryLineFor's name falls back to the line itself, which trims to
        // empty, so the second AddItem fails and the loop stops there (§17 step 6).
        { line: '   ', quantity: null, unit: null, item: null },
      ],
    });
    const { syncStore, kitchenId, weekId } = await openNewMeal([[url, recipe]]);

    fireEvent.change(nameField(), { target: { value: 'Chana masala night' } });
    fireEvent.change(linkField(), { target: { value: url } });
    fireEvent.click(getRecipeButton());

    expect(await screen.findByText('Something went wrong importing that recipe.')).toBeTruthy();
    // The recipe and meal relink from the successful ImportRecipe stay; only the fan-out stopped.
    expect(await syncStore.getRecipes(kitchenId)).toHaveLength(1);
    const items = await syncStore.getItems(kitchenId, weekId);
    expect(items).toHaveLength(1);
    expect(items[0]?.name.value).toBe('chickpeas');
  });
});
