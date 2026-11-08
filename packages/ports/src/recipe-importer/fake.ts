import type { ParsedRecipe, RecipeImportError, Result } from '@grocs/core';
import { err, ok } from '@grocs/core';
import type { RecipeImporter } from './port.ts';

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
 * A recipe importer held in memory, standing in for Grocs' server (decision-15). Seeded entries
 * key on the exact URL string, the way the server keys its cache on the normalised URL - a test
 * seeds already-normalised URLs. Anything else: a non-http(s) or unparseable URL is 'invalid-url',
 * an unseeded http(s) URL is 'not-a-recipe'.
 */
export class FakeRecipeImporter implements RecipeImporter {
  readonly #entries: Map<string, RecipeImportOutcome>;
  readonly #calls: string[] = [];

  constructor(entries?: Iterable<readonly [url: string, outcome: RecipeImportOutcome]>) {
    this.#entries = new Map(entries ?? []);
  }

  /** URLs passed to `importRecipe`, in order (test inspection only). */
  get calls(): readonly string[] {
    return [...this.#calls];
  }

  async importRecipe(url: string): Promise<Result<ParsedRecipe, RecipeImportError>> {
    this.#calls.push(url);
    const seeded = this.#entries.get(url);
    if (seeded !== undefined) return isParsedRecipe(seeded) ? ok(seeded) : err(seeded);
    if (!looksValid(url)) return err('invalid-url');
    return err('not-a-recipe');
  }
}
