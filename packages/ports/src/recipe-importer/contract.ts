import type { TestApi } from '../testing.ts';
import type { RecipeImportError } from '@grocs/core';
import type { RecipeImporter } from './port.ts';

export interface RecipeImporterSubject {
  readonly importer: RecipeImporter;
  /** An already-normalised URL on host recipe.invalid that the server has cached (seeded), with what it must return. */
  readonly known: { readonly url: string; readonly recipeId: string; readonly title: string };
  /** An already-normalised URL on host recipe.invalid whose failure is remembered (seeded), and the error it must return. */
  readonly remembered: { readonly url: string; readonly error: Exclude<RecipeImportError, 'invalid-url'> };
  /** Not an http(s) URL, e.g. 'not a link' or 'ftp://x'. */
  readonly invalidUrl: string;
  dispose?(): Promise<void>;
}

/**
 * Every RecipeImporter passes this suite (decision-15). No case needs network access: every
 * seeded URL uses the reserved, non-resolvable host `recipe.invalid`, so a provider that runs
 * this suite against a live server (e.g. through the Functions emulator) never reaches a real
 * recipe site.
 */
export function recipeImporterContract(t: TestApi, make: () => Promise<RecipeImporterSubject>): void {
  const withSubject = (body: (s: RecipeImporterSubject) => Promise<void>) => async (): Promise<void> => {
    const subject = await make();
    try {
      await body(subject);
    } finally {
      await subject.dispose?.();
    }
  };

  t.describe('RecipeImporter contract', () => {
    t.it(
      'imports the known URL as a recipe with a matching id, title and source, and at least one ingredient and step',
      withSubject(async ({ importer, known }) => {
        const result = await importer.importRecipe(known.url);
        if (!result.ok) throw new Error(`expected ok, got err(${result.error})`);
        t.expect(result.value.recipeId).toBe(known.recipeId);
        t.expect(result.value.title).toBe(known.title);
        t.expect(result.value.sourceUrl).toBe(known.url);
        t.expect(result.value.ingredients.length).toBeGreaterThan(0);
        t.expect(result.value.steps.length).toBeGreaterThan(0);
      }),
    );

    t.it(
      'gives the same recipeId when the known URL is imported twice',
      withSubject(async ({ importer, known }) => {
        const first = await importer.importRecipe(known.url);
        const second = await importer.importRecipe(known.url);
        if (!first.ok || !second.ok) throw new Error('expected both imports to be ok');
        t.expect(second.value.recipeId).toBe(first.value.recipeId);
      }),
    );

    t.it(
      "returns the remembered error for a URL whose failure the server remembers",
      withSubject(async ({ importer, remembered }) => {
        const result = await importer.importRecipe(remembered.url);
        t.expect(result.ok).toBe(false);
        if (result.ok) throw new Error('expected err');
        t.expect(result.error).toBe(remembered.error);
      }),
    );

    t.it(
      "returns 'invalid-url' for a URL that is not http(s)",
      withSubject(async ({ importer, invalidUrl }) => {
        const result = await importer.importRecipe(invalidUrl);
        t.expect(result.ok).toBe(false);
        if (result.ok) throw new Error('expected err');
        t.expect(result.error).toBe('invalid-url');
      }),
    );
  });
}
