// Decision-16's mapping rules: turning an import into a kitchen recipe, and an ingredient into a
// grocery line. Lives in core so the import command and the screens share one set of rules (R25).
import type { Stamp } from '../merge/lww.ts';
import type { ParsedIngredient, ParsedRecipe, Recipe } from './recipe.ts';

/** One grocery line the meal form adds for each ingredient (decision-16). */
export interface GroceryLine {
  readonly name: string;
  readonly amount: string | null;
}

/**
 * The kitchen record for an import (decision-16): id = recipeId, addedBy and createdAt from the
 * stamp, deleted null. Content is copied from the parsed recipe unchanged.
 */
export function recipeFromImport(parsed: ParsedRecipe, stamp: Stamp): Recipe {
  return {
    id: parsed.recipeId,
    addedBy: stamp.by,
    createdAt: stamp.at,
    sourceUrl: parsed.sourceUrl,
    title: parsed.title,
    yield: parsed.yield,
    steps: parsed.steps,
    ingredients: parsed.ingredients,
    image: parsed.image,
    deleted: null,
  };
}

/** The live (not deleted) recipe whose sourceUrl === link, or null. A null link is always null. */
export function recipeForLink(recipes: readonly Recipe[], link: string | null): Recipe | null {
  if (link === null) return null;
  return recipes.find((recipe) => recipe.deleted === null && recipe.sourceUrl === link) ?? null;
}

/** decision-16: name = item ?? line; amount = quantity and unit as written, joined by ' ', or null. */
export function groceryLineFor(ingredient: ParsedIngredient): GroceryLine {
  const parts = [ingredient.quantity, ingredient.unit].filter((part): part is string => part !== null);
  return {
    name: ingredient.item ?? ingredient.line,
    amount: parts.length > 0 ? parts.join(' ') : null,
  };
}
