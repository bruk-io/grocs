// The recipe-import contract shared by the apps and the server (decision-15), and the kitchen record (decision-16). Types only.
import type { Stamp } from '../merge/lww.ts';

/** One ingredient line. `line` is the source of truth; the parsed parts are best effort. */
export interface ParsedIngredient {
  /** As written, trimmed, non-empty. */
  readonly line: string;
  /** As written in the line, e.g. '1 1/2', '½', '2-3'; null when the line has none. */
  readonly quantity: string | null;
  /** As written, e.g. 'cup', 'tbsp', '(14-ounce) can'; null when the line has none. */
  readonly unit: string | null;
  /** The thing to buy, e.g. 'chickpeas'; null when it cannot be told apart. */
  readonly item: string | null;
}

/** What the import function returns. recipeId = server cache key (sha256 hex of sourceUrl). */
export interface ParsedRecipe {
  readonly recipeId: string;
  /** The normalised URL (contract section 9). */
  readonly sourceUrl: string;
  /** Non-empty. */
  readonly title: string;
  /** e.g. '4 servings'; a number or a list is normalised to one string. */
  readonly yield: string | null;
  /** At least one, flattened from HowToSection. */
  readonly steps: readonly string[];
  /** At least one. */
  readonly ingredients: readonly ParsedIngredient[];
  /** Absolute URL. */
  readonly image: string | null;
}

/** Why an import failed (decision-15). */
export type RecipeImportError =
  | 'invalid-url' | 'not-found' | 'blocked' | 'unreachable' | 'not-a-recipe' | 'incomplete-recipe';

/** A kitchen record at kitchens/{kitchenId}/recipes/{id} (decision-16). Content is written once and never restamped. */
export interface Recipe {
  /** Equals ParsedRecipe.recipeId. */
  readonly id: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly sourceUrl: string;
  readonly title: string;
  readonly yield: string | null;
  readonly steps: readonly string[];
  readonly ingredients: readonly ParsedIngredient[];
  readonly image: string | null;
  /** Once set it stays (R20). */
  readonly deleted: Stamp | null;
}
