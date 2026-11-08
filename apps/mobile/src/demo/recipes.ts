// The demo build's recipe fixtures (decision-12), standing in for a real import through
// MemoryRecipeImporter (contract §17). Keyed by exact URL string - MemoryRecipeImporter does no
// normalisation, so a key must equal what the demo meal's `link` field holds (see compose-demo.ts's
// seed()).
import type { ParsedRecipe } from '@grocs/core';

/** The link every demo meal with a recipe carries today (compose-demo.ts's seed()). */
const DEMO_RECIPE_LINK = 'https://example.com';

const demoRecipe: ParsedRecipe = {
  recipeId: 'demo-recipe-1',
  sourceUrl: DEMO_RECIPE_LINK,
  title: 'Weeknight dinner',
  yield: '4 servings',
  steps: ['Prep the vegetables.', 'Cook everything together.', 'Serve warm.'],
  ingredients: [
    { line: '1 onion, diced', quantity: '1', unit: null, item: 'onion' },
    { line: '2 cloves garlic, minced', quantity: '2', unit: 'cloves', item: 'garlic' },
    { line: 'Salt and pepper to taste', quantity: null, unit: null, item: null },
  ],
  image: null,
};

/** Entries for MemoryRecipeImporter, keyed by the demo meals' links. */
export const demoRecipes: ReadonlyMap<string, ParsedRecipe> = new Map([[DEMO_RECIPE_LINK, demoRecipe]]);
