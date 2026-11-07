import type { ParsedRecipe, RecipeImportError, Result } from '@grocs/core';
import { err, ok } from '@grocs/core';
import type { RecipeImporter } from '@grocs/ports';

/** What a seeded URL resolves to: a parsed recipe, or the error the server would have returned. */
export type RecipeImportOutcome = ParsedRecipe | RecipeImportError;

function isParsedRecipe(outcome: RecipeImportOutcome): outcome is ParsedRecipe {
  return typeof outcome !== 'string';
}

function looksValid(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * A recipe importer held in memory for the demo build (decision-12), standing in for Grocs' server
 * (decision-15). It shares the FakeRecipeImporter's approach, not its code (decision-12): a seeded
 * entry keys on the exact URL string, the way the server keys its cache on the normalised URL, so a
 * caller seeds already-normalised URLs. Anything else: a non-http(s) or unparseable URL is
 * 'invalid-url', an unseeded http(s) URL is 'not-a-recipe'. It touches no network.
 */
export class MemoryRecipeImporter implements RecipeImporter {
  readonly #entries: Map<string, RecipeImportOutcome>;

  constructor(entries?: Iterable<readonly [url: string, outcome: RecipeImportOutcome]>) {
    this.#entries = new Map(entries ?? []);
  }

  async importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>> {
    const seeded = this.#entries.get(url);
    if (seeded !== undefined) return isParsedRecipe(seeded) ? ok(seeded) : err(seeded);
    if (!looksValid(url)) return err('invalid-url');
    return err('not-a-recipe');
  }
}
