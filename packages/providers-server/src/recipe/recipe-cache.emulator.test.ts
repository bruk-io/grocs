// FirestoreRecipeCache against the Firestore emulator (TASK-74.4.6, contract §10, §11). Runs
// importRecipe with a fake FetchPage (no real network: that's createLiveFetchPage's own test) and
// the real Admin-SDK cache, so this proves the cache's read/write shapes and the full
// cache-hit/failure-memory/error-kind ordering together. The cache's three collections are shared
// and top-level across the whole emulator run, so every test below uses its own recipe.invalid URL.
import { describe, expect, it } from 'vitest';
import type { RecipeImportError } from '@grocs/core';
import { adminFirestore } from '../../../../firebase/emulator-client.ts';
import { FirestoreRecipeCache } from './firestore-recipe-cache.ts';
import type { FetchedPage, FetchPage } from './fetch-page.ts';
import { importRecipe } from './import-recipe.ts';
import { normaliseRecipeUrl } from './pure/normalise-url.ts';
import { parseRecipeJsonLd } from './pure/recipe-schema.ts';
import { recipeKey } from './recipe-key.ts';
import type { CachedFailure, CachedRecipe, CachedSource, RecipeCache } from './recipe-cache.ts';

/** Wraps a real RecipeCache and logs every method call, so a test can assert the cache was (or was
 * not) touched at all - not just that a particular collection ended up empty. */
function recordingCache(cache: RecipeCache): { readonly cache: RecipeCache; readonly log: string[] } {
  const log: string[] = [];
  return {
    log,
    cache: {
      async getRecipe(key: string) {
        log.push(`getRecipe:${key}`);
        return cache.getRecipe(key);
      },
      async getSource(key: string) {
        log.push(`getSource:${key}`);
        return cache.getSource(key);
      },
      async getFailure(key: string) {
        log.push(`getFailure:${key}`);
        return cache.getFailure(key);
      },
      async saveRecipe(key: string, recipe: CachedRecipe, source: CachedSource) {
        log.push(`saveRecipe:${key}`);
        return cache.saveRecipe(key, recipe, source);
      },
      async saveFailure(key: string, failure: CachedFailure) {
        log.push(`saveFailure:${key}`);
        return cache.saveFailure(key, failure);
      },
    },
  };
}

function normalise(url: string): string {
  const result = normaliseRecipeUrl(url);
  if (!result.ok) throw new Error('expected a valid URL in this test');
  return result.value;
}

function recipeHtml(title: string): string {
  return `<html><head><script type="application/ld+json">
{"@type":"Recipe","name":"${title}","recipeIngredient":["1 cup broth"],"recipeInstructions":["Boil it."]}
</script></head></html>`;
}

const NOT_A_RECIPE_HTML = '<html><head></head><body>no ld+json here</body></html>';
const INCOMPLETE_RECIPE_HTML = `<html><head><script type="application/ld+json">
{"@type":"Recipe","name":"No ingredients","recipeInstructions":["Boil it."]}
</script></head></html>`;

function makeFetchPage(byUrl: Readonly<Record<string, FetchedPage>>): { readonly fetchPage: FetchPage; readonly calls: string[] } {
  const calls: string[] = [];
  const fetchPage: FetchPage = async (url) => {
    calls.push(url);
    return byUrl[url] ?? { kind: 'failed', error: 'unreachable' };
  };
  return { fetchPage, calls };
}

async function readRaw(db: ReturnType<typeof adminFirestore>, path: string): Promise<Record<string, unknown> | undefined> {
  const snap = await db.doc(path).get();
  return snap.exists ? (snap.data() as Record<string, unknown>) : undefined;
}

describe('FirestoreRecipeCache (emulator)', () => {
  it('a miss stores both docs, read back raw with the documented shapes', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-miss';
    const { fetchPage } = makeFetchPage({ [normalise(url)]: { kind: 'page', html: recipeHtml('Miss Soup') } });

    const result = await importRecipe(url, { fetchPage, cache, now: () => 1_000 });
    expect(result.ok).toBe(true);
    const key = recipeKey(normalise(url));

    const recipeDoc = await readRaw(db, `recipes/${key}`);
    expect(recipeDoc).toMatchObject({ schemaVersion: 1, url: normalise(url), parserVersion: 1, fetchedAt: 1_000 });
    expect(recipeDoc).not.toHaveProperty('jsonLd');
    expect((recipeDoc!.recipe as Record<string, unknown>).title).toBe('Miss Soup');

    const sourceDoc = await readRaw(db, `recipeSources/${key}`);
    expect(sourceDoc).toMatchObject({ schemaVersion: 1, url: normalise(url), fetchedAt: 1_000 });
    expect(sourceDoc).not.toHaveProperty('recipe');
    expect(typeof sourceDoc!.jsonLd).toBe('string');

    const failureDoc = await readRaw(db, `recipeFailures/${key}`);
    expect(failureDoc).toBeUndefined();
  });

  it('a hit makes no fetch', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-hit';
    const normalised = normalise(url);
    const key = recipeKey(normalised);
    await db.doc(`recipes/${key}`).set({
      schemaVersion: 1,
      url: normalised,
      recipe: { recipeId: key, sourceUrl: normalised, title: 'Cached Soup', yield: null, steps: ['Boil.'], ingredients: [], image: null },
      parserVersion: 1,
      fetchedAt: 500,
    });
    const { fetchPage, calls } = makeFetchPage({});

    const result = await importRecipe(url, { fetchPage, cache, now: () => 1_000 });
    expect(result).toEqual({ ok: true, value: { recipeId: key, sourceUrl: normalised, title: 'Cached Soup', yield: null, steps: ['Boil.'], ingredients: [], image: null } });
    expect(calls).toEqual([]);
  });

  it('a remembered failure within the 24h window returns the error with no fetch; after it expires, the page is refetched and the failure doc is deleted', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-failure-memory';
    const normalised = normalise(url);
    const key = recipeKey(normalised);

    // The fetch fails until flipped to succeed, so the first two imports see a live "unreachable"
    // and the third (past the memory window) sees the page actually come back.
    let succeeds = false;
    const calls: string[] = [];
    const fetchPage: FetchPage = async (reached) => {
      calls.push(reached);
      return succeeds ? { kind: 'page', html: recipeHtml('Refetched Soup') } : { kind: 'failed', error: 'unreachable' };
    };

    const failedAt = 1_000;
    const withinResult = await importRecipe(url, { fetchPage, cache, now: () => failedAt });
    expect(withinResult).toEqual({ ok: false, error: 'unreachable' });
    expect(calls).toEqual([normalised]); // the first call: no doc yet, so unreachable is fetched and remembered
    calls.length = 0;

    const stillWithin = await importRecipe(url, { fetchPage, cache, now: () => failedAt + 1 });
    expect(stillWithin).toEqual({ ok: false, error: 'unreachable' });
    expect(calls).toEqual([]); // the remembered failure answers; fetchPage is not called again

    succeeds = true;
    const pastWindow = await importRecipe(url, { fetchPage, cache, now: () => failedAt + 24 * 60 * 60 * 1000 });
    expect(pastWindow.ok).toBe(true);
    expect(calls).toEqual([normalised]);

    const failureDoc = await readRaw(db, `recipeFailures/${key}`);
    expect(failureDoc).toBeUndefined();
  });

  const errorCases: readonly { readonly label: string; readonly page: FetchedPage; readonly error: RecipeImportError }[] = [
    { label: 'not-found', page: { kind: 'failed', error: 'not-found' }, error: 'not-found' },
    { label: 'blocked', page: { kind: 'failed', error: 'blocked' }, error: 'blocked' },
    { label: 'unreachable', page: { kind: 'failed', error: 'unreachable' }, error: 'unreachable' },
    { label: 'not-a-recipe', page: { kind: 'page', html: NOT_A_RECIPE_HTML }, error: 'not-a-recipe' },
    { label: 'incomplete-recipe', page: { kind: 'page', html: INCOMPLETE_RECIPE_HTML }, error: 'incomplete-recipe' },
  ];

  for (const { label, page, error } of errorCases) {
    it(`each error kind (${label}) is stored in recipeFailures`, async () => {
      const db = adminFirestore();
      const cache = new FirestoreRecipeCache(db);
      const url = `https://recipe.invalid/fsrc-error-${label}`;
      const normalised = normalise(url);
      const key = recipeKey(normalised);
      const { fetchPage } = makeFetchPage({ [normalised]: page });

      const result = await importRecipe(url, { fetchPage, cache, now: () => 2_000 });
      expect(result).toEqual({ ok: false, error });

      const failureDoc = await readRaw(db, `recipeFailures/${key}`);
      expect(failureDoc).toEqual({ schemaVersion: 1, error, failedAt: 2_000 });
      const recipeDoc = await readRaw(db, `recipes/${key}`);
      expect(recipeDoc).toBeUndefined();
    });
  }

  it('invalid-url stores nothing in any of the three collections', async () => {
    const db = adminFirestore();
    const { cache, log } = recordingCache(new FirestoreRecipeCache(db));
    const url = 'not a url at all';
    const { fetchPage, calls } = makeFetchPage({});

    const result = await importRecipe(url, { fetchPage, cache, now: () => 3_000 });
    expect(result).toEqual({ ok: false, error: 'invalid-url' });
    expect(calls).toEqual([]);
    // invalid-url has no key (recipeKey needs an already-normalised URL), so there is nothing to
    // read back by key; the proof is that the cache (and fetchPage) were never touched at all -
    // the recording cache's log, not just the result, is what proves it.
    expect(log).toEqual([]);
  });

  it('a source re-parse equals the stored recipe', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-reparse';
    const normalised = normalise(url);
    const key = recipeKey(normalised);
    const { fetchPage } = makeFetchPage({ [normalised]: { kind: 'page', html: recipeHtml('Reparse Soup') } });

    const result = await importRecipe(url, { fetchPage, cache, now: () => 4_000 });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('unreachable');

    const recipeDoc = await readRaw(db, `recipes/${key}`);
    const storedRecipe = recipeDoc!.recipe as Record<string, unknown>;
    const { recipeId: _recipeId, sourceUrl: _sourceUrl, ...storedContent } = storedRecipe;

    const sourceDoc = await readRaw(db, `recipeSources/${key}`);
    const jsonLd = JSON.parse(sourceDoc!.jsonLd as string);
    const reparsed = parseRecipeJsonLd(jsonLd);
    expect(reparsed.ok).toBe(true);
    if (!reparsed.ok) throw new Error('unreachable');
    // The recipe this test's fixture produces has no image, so resolveImage's absolute-URL
    // resolution (import-recipe.ts, done once between parse and store) never fires here; a
    // re-parse of the stored jsonLd is directly comparable to the stored recipe doc's content.
    // Comparing against the Firestore-read document (not result.value, importRecipe's in-memory
    // return) proves the round trip through recipes/{key} and recipeSources/{key} still agrees.
    expect(reparsed.value).toEqual(storedContent);
  });

  it('getSource round-trips a nested-array jsonLd shape (HowToSection.itemListElement)', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-nested-sections';
    const normalised = normalise(url);
    const key = recipeKey(normalised);

    const jsonLd = {
      '@type': 'Recipe',
      name: 'Nested Sections Soup',
      recipeIngredient: ['1 cup broth'],
      recipeInstructions: [
        {
          '@type': 'HowToSection',
          name: 'Prep',
          itemListElement: [
            { '@type': 'HowToStep', text: 'Chop the vegetables.' },
            { '@type': 'HowToStep', text: 'Measure the broth.' },
          ],
        },
        { '@type': 'HowToStep', text: 'Boil it.' },
      ],
    };

    await cache.saveRecipe(
      key,
      { url: normalised, recipe: { recipeId: key, sourceUrl: normalised, title: 'Nested Sections Soup', yield: null, steps: ['Chop the vegetables.', 'Measure the broth.', 'Boil it.'], ingredients: [], image: null }, parserVersion: 1, fetchedAt: 1 },
      { url: normalised, jsonLd, fetchedAt: 1 },
    );

    const sourceDoc = await readRaw(db, `recipeSources/${key}`);
    expect(typeof sourceDoc!.jsonLd).toBe('string');

    const got = await cache.getSource(key);
    expect(got).not.toBeNull();
    expect(got!.jsonLd).toEqual(jsonLd);
  });

  it('an undecodable doc reads as null (a miss), not a thrown error', async () => {
    const db = adminFirestore();
    const cache = new FirestoreRecipeCache(db);
    const url = 'https://recipe.invalid/fsrc-undecodable';
    const normalised = normalise(url);
    const key = recipeKey(normalised);

    await db.doc(`recipes/${key}`).set({ schemaVersion: 1, url: normalised, recipe: { title: 'not a full ParsedRecipe' }, parserVersion: 1, fetchedAt: 1 });
    await db.doc(`recipeSources/${key}`).set({ schemaVersion: 1, url: normalised, jsonLd: 'not valid json {{{', fetchedAt: 1 });
    await db.doc(`recipeFailures/${key}`).set({ schemaVersion: 1, error: 'not-a-real-error-kind', failedAt: 1 });

    await expect(cache.getRecipe(key)).resolves.toBeNull();
    await expect(cache.getSource(key)).resolves.toBeNull();
    await expect(cache.getFailure(key)).resolves.toBeNull();
  });
});
