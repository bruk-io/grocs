import { describe, expect, it } from 'vitest';
import { groceryLineFor, recipeForLink, recipeFromImport } from './kitchen-recipe.ts';
import type { ParsedIngredient, ParsedRecipe, Recipe } from './recipe.ts';

const parsed: ParsedRecipe = {
  recipeId: 'abc123',
  sourceUrl: 'https://example.com/tacos',
  title: 'Tacos',
  yield: '4 servings',
  steps: ['Cook the meat.', 'Fill the tortillas.'],
  ingredients: [{ line: '1 lb ground beef', quantity: '1', unit: 'lb', item: 'ground beef' }],
  image: 'https://example.com/tacos.jpg',
};

const stamp = { at: 1000, by: 'alex' };

describe('recipeFromImport (decision-16)', () => {
  it('sets id = recipeId, addedBy and createdAt from the stamp, deleted null, content unchanged', () => {
    const recipe = recipeFromImport(parsed, stamp);
    expect(recipe.id).toBe('abc123');
    expect(recipe.addedBy).toBe('alex');
    expect(recipe.createdAt).toBe(1000);
    expect(recipe.deleted).toBeNull();
    expect(recipe.sourceUrl).toBe(parsed.sourceUrl);
    expect(recipe.title).toBe(parsed.title);
    expect(recipe.yield).toBe(parsed.yield);
    expect(recipe.steps).toEqual(parsed.steps);
    expect(recipe.ingredients).toEqual(parsed.ingredients);
    expect(recipe.image).toBe(parsed.image);
  });
});

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 'r1',
    addedBy: 'alex',
    createdAt: 1,
    sourceUrl: 'https://example.com/tacos',
    title: 'Tacos',
    yield: null,
    steps: ['Cook.'],
    ingredients: [],
    image: null,
    deleted: null,
    ...overrides,
  };
}

describe('recipeForLink (decision-16)', () => {
  it('matches a live recipe on exact sourceUrl', () => {
    const live = recipe({ id: 'r1', sourceUrl: 'https://example.com/tacos' });
    const other = recipe({ id: 'r2', sourceUrl: 'https://example.com/burritos' });
    expect(recipeForLink([other, live], 'https://example.com/tacos')).toBe(live);
  });

  it('skips a deleted recipe even when its sourceUrl matches', () => {
    const deleted = recipe({ id: 'r1', sourceUrl: 'https://example.com/tacos', deleted: stamp });
    expect(recipeForLink([deleted], 'https://example.com/tacos')).toBeNull();
  });

  it('returns null for a null link', () => {
    const live = recipe({ id: 'r1', sourceUrl: 'https://example.com/tacos' });
    expect(recipeForLink([live], null)).toBeNull();
  });

  it('returns null when nothing matches', () => {
    const live = recipe({ id: 'r1', sourceUrl: 'https://example.com/tacos' });
    expect(recipeForLink([live], 'https://example.com/burritos')).toBeNull();
  });
});

describe('groceryLineFor (decision-16)', () => {
  const ingredient = (overrides: Partial<ParsedIngredient>): ParsedIngredient => ({
    line: '½ cup sugar',
    quantity: null,
    unit: null,
    item: null,
    ...overrides,
  });

  it('item + quantity + unit: name from item, amount from quantity and unit joined', () => {
    const line = ingredient({ line: '½ cup sugar', quantity: '½', unit: 'cup', item: 'sugar' });
    expect(groceryLineFor(line)).toEqual({ name: 'sugar', amount: '½ cup' });
  });

  it('quantity only: amount is the quantity alone', () => {
    const line = ingredient({ line: '2 eggs', quantity: '2', unit: null, item: 'eggs' });
    expect(groceryLineFor(line)).toEqual({ name: 'eggs', amount: '2' });
  });

  it('unit only: amount is the unit alone', () => {
    const line = ingredient({ line: 'a pinch of salt', quantity: null, unit: 'pinch', item: 'salt' });
    expect(groceryLineFor(line)).toEqual({ name: 'salt', amount: 'pinch' });
  });

  it('no quantity or unit: amount is null', () => {
    const line = ingredient({ line: 'salt to taste', quantity: null, unit: null, item: 'salt' });
    expect(groceryLineFor(line)).toEqual({ name: 'salt', amount: null });
  });

  it('no item: name falls back to the line', () => {
    const line = ingredient({ line: 'a splash of lime juice', quantity: null, unit: null, item: null });
    expect(groceryLineFor(line)).toEqual({ name: 'a splash of lime juice', amount: null });
  });
});
