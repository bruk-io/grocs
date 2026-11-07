// The server-side recipe cache (contract TASK-74 §10, §11). Types and the interface only: the
// Firestore implementation (FirestoreRecipeCache) is TASK-74.4.6. Kept outside pure/ because an
// implementation does I/O, even though these declarations themselves have no logic.
import type { ParsedRecipe, RecipeImportError } from '@grocs/core';
import type { RecipeJsonLd } from './pure/json-ld.ts';

export interface CachedRecipe {
  readonly url: string;
  readonly recipe: ParsedRecipe;
  readonly parserVersion: number;
  readonly fetchedAt: number;
}

export interface CachedSource {
  readonly url: string;
  readonly jsonLd: RecipeJsonLd;
  readonly fetchedAt: number;
}

export interface CachedFailure {
  readonly error: RecipeImportError;
  readonly failedAt: number;
}

/** Keyed by recipeKey(normalisedUrl) (§11). A doc that fails to decode is a miss (null), never a thrown error. */
export interface RecipeCache {
  getRecipe(key: string): Promise<CachedRecipe | null>;
  getSource(key: string): Promise<CachedSource | null>;
  getFailure(key: string): Promise<CachedFailure | null>;
  /** Writes recipes/{key} and recipeSources/{key}, and deletes recipeFailures/{key}, in one batch. */
  saveRecipe(key: string, recipe: CachedRecipe, source: CachedSource): Promise<void>;
  saveFailure(key: string, failure: CachedFailure): Promise<void>;
}
