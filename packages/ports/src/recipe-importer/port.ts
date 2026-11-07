import type { ParsedRecipe, RecipeImportError, Result } from '@grocs/core';

/**
 * The app's one way to turn a recipe link into a parsed recipe (decision-15). The apps know
 * nothing about recipe sites or parsing: this always asks Grocs' own server, which fetches,
 * parses and caches the page itself. A provider never fetches a third-party site directly.
 */
export interface RecipeImporter {
  /** Asks Grocs' server for the recipe at `url`. Never contacts a recipe site itself. */
  importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>>;
}
