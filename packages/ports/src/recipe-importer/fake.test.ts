import { describe, expect, it } from 'vitest';
import type { ParsedRecipe } from '@grocs/core';
import { recipeImporterContract } from './contract.ts';
import { FakeRecipeImporter } from './fake.ts';

const KNOWN_URL = 'https://recipe.invalid/pancakes';
const REMEMBERED_URL = 'https://recipe.invalid/blocked-page';

const knownRecipe: ParsedRecipe = {
  recipeId: 'recipe-known-1',
  sourceUrl: KNOWN_URL,
  title: 'Pancakes',
  yield: '4 servings',
  steps: ['Mix the batter.', 'Cook on a griddle.'],
  ingredients: [{ line: '1 cup flour', quantity: '1', unit: 'cup', item: 'flour' }],
  image: null,
};

recipeImporterContract({ describe, it, expect }, async () => {
  const importer = new FakeRecipeImporter([
    [KNOWN_URL, knownRecipe],
    [REMEMBERED_URL, 'blocked'],
  ]);
  return {
    importer,
    known: { url: KNOWN_URL, recipeId: knownRecipe.recipeId, title: knownRecipe.title },
    remembered: { url: REMEMBERED_URL, error: 'blocked' },
    invalidUrl: 'not a link',
  };
});

describe('FakeRecipeImporter', () => {
  it('returns not-a-recipe for a well-formed but unseeded URL', async () => {
    const importer = new FakeRecipeImporter();
    const result = await importer.importRecipe('https://recipe.invalid/unknown-page');
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected err');
    expect(result.error).toBe('not-a-recipe');
  });

  it('records every call, in order', async () => {
    const importer = new FakeRecipeImporter([[KNOWN_URL, knownRecipe]]);
    await importer.importRecipe(KNOWN_URL);
    await importer.importRecipe('not a link');
    await importer.importRecipe('https://recipe.invalid/unknown-page');
    expect(importer.calls).toEqual([KNOWN_URL, 'not a link', 'https://recipe.invalid/unknown-page']);
  });
});
