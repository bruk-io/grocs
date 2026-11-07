import { describe, expect, it } from 'vitest';
import type { RecipeImportError } from '@grocs/core';
import type { FetchedPage, FetchPage } from './fetch-page.ts';
import { FAILURE_MEMORY_MS, importRecipe, resolveImage } from './import-recipe.ts';
import { normaliseRecipeUrl } from './pure/normalise-url.ts';
import { PARSER_VERSION, parseRecipeJsonLd } from './pure/recipe-schema.ts';
import { recipeKey } from './recipe-key.ts';
import type { CachedFailure, CachedRecipe, CachedSource, RecipeCache } from './recipe-cache.ts';

const PAGE_URL = 'https://recipe.invalid/soup';

function recipeHtml(image: string): string {
  return `<html><head><script type="application/ld+json">
{"@type":"Recipe","name":"Test Soup","recipeIngredient":["1 cup broth"],"recipeInstructions":["Boil it."],"image":"${image}"}
</script></head></html>`;
}

const NOT_A_RECIPE_HTML = '<html><head></head><body>no ld+json here</body></html>';
const INCOMPLETE_RECIPE_HTML = `<html><head><script type="application/ld+json">
{"@type":"Recipe","name":"No ingredients","recipeInstructions":["Boil it."]}
</script></head></html>`;

/** A RecipeCache held in Maps, built to the documented interface: saveRecipe deletes the matching
 * failure itself (contract §10's "in one batch"), not importRecipe. A doc that fails to decode is
 * represented the same way a missing doc is: getRecipe/getFailure/getSource all return null for an
 * unseeded key, which is exactly the "undecodable doc -> miss" behaviour importRecipe must tolerate. */
class TestRecipeCache implements RecipeCache {
  readonly recipes = new Map<string, CachedRecipe>();
  readonly sources = new Map<string, CachedSource>();
  readonly failures = new Map<string, CachedFailure>();

  async getRecipe(key: string): Promise<CachedRecipe | null> {
    return this.recipes.get(key) ?? null;
  }
  async getSource(key: string): Promise<CachedSource | null> {
    return this.sources.get(key) ?? null;
  }
  async getFailure(key: string): Promise<CachedFailure | null> {
    return this.failures.get(key) ?? null;
  }
  async saveRecipe(key: string, recipe: CachedRecipe, source: CachedSource): Promise<void> {
    this.recipes.set(key, recipe);
    this.sources.set(key, source);
    this.failures.delete(key);
  }
  async saveFailure(key: string, failure: CachedFailure): Promise<void> {
    this.failures.set(key, failure);
  }
}

function makeFetchPage(byUrl: Readonly<Record<string, FetchedPage>>): { readonly fetchPage: FetchPage; readonly calls: string[] } {
  const calls: string[] = [];
  const fetchPage: FetchPage = async (url) => {
    calls.push(url);
    return byUrl[url] ?? { kind: 'failed', error: 'unreachable' };
  };
  return { fetchPage, calls };
}

function normalise(url: string): string {
  const result = normaliseRecipeUrl(url);
  if (!result.ok) throw new Error('expected a valid URL in this test');
  return result.value;
}

describe('importRecipe', () => {
  it('a cache hit does not call fetchPage', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const cached: CachedRecipe = {
      url: PAGE_URL,
      recipe: { recipeId: key, sourceUrl: PAGE_URL, title: 'Cached Soup', yield: null, steps: ['Boil.'], ingredients: [], image: null },
      parserVersion: PARSER_VERSION,
      fetchedAt: 0,
    };
    cache.recipes.set(key, cached);
    const { fetchPage, calls } = makeFetchPage({});

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(calls).toHaveLength(0);
    expect(result).toEqual({ ok: true, value: cached.recipe });
  });

  it('a miss fetches once and saves both recipe and source', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const { fetchPage, calls } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(calls).toEqual([PAGE_URL]);
    expect(result.ok).toBe(true);
    expect(cache.recipes.has(key)).toBe(true);
    expect(cache.sources.has(key)).toBe(true);
    expect(cache.recipes.get(key)!.parserVersion).toBe(PARSER_VERSION);
    expect(cache.recipes.get(key)!.fetchedAt).toBe(1_000);
  });

  it('a utm-tagged variant of a cached URL hits the same key (no fetch)', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const cached: CachedRecipe = {
      url: PAGE_URL,
      recipe: { recipeId: key, sourceUrl: PAGE_URL, title: 'Cached Soup', yield: null, steps: ['Boil.'], ingredients: [], image: null },
      parserVersion: PARSER_VERSION,
      fetchedAt: 0,
    };
    cache.recipes.set(key, cached);
    const { fetchPage, calls } = makeFetchPage({});

    const result = await importRecipe(`${PAGE_URL}?utm_source=newsletter`, { fetchPage, cache, now: () => 1_000 });

    expect(calls).toHaveLength(0);
    expect(result).toEqual({ ok: true, value: cached.recipe });
  });

  it('a remembered failure within 24h makes no fetch and returns the same error', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    cache.failures.set(key, { error: 'not-found', failedAt: 10_000 });
    const { fetchPage, calls } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 10_000 + FAILURE_MEMORY_MS - 1 });

    expect(calls).toHaveLength(0);
    expect(result).toEqual({ ok: false, error: 'not-found' });
  });

  it('fetches again exactly at the 24h boundary', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    cache.failures.set(key, { error: 'not-found', failedAt: 10_000 });
    const { fetchPage, calls } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 10_000 + FAILURE_MEMORY_MS });

    expect(calls).toEqual([PAGE_URL]);
    expect(result.ok).toBe(true);
  });

  it('fetches again well past the 24h boundary', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    cache.failures.set(key, { error: 'not-found', failedAt: 10_000 });
    const { fetchPage, calls } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 10_000 + FAILURE_MEMORY_MS * 10 });

    expect(calls).toEqual([PAGE_URL]);
    expect(result.ok).toBe(true);
  });

  it('a later success clears the remembered failure', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    cache.failures.set(key, { error: 'not-found', failedAt: 10_000 });
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 10_000 + FAILURE_MEMORY_MS });

    expect(result.ok).toBe(true);
    expect(await cache.getFailure(key)).toBeNull();
  });

  it("'invalid-url' is never cached (no key computed, cache and fetchPage both untouched)", async () => {
    const cache = new TestRecipeCache();
    const { fetchPage, calls } = makeFetchPage({});

    const result = await importRecipe('not a link', { fetchPage, cache, now: () => 1_000 });

    expect(result).toEqual({ ok: false, error: 'invalid-url' });
    expect(calls).toHaveLength(0);
    expect(cache.recipes.size).toBe(0);
    expect(cache.failures.size).toBe(0);
  });

  const FETCH_FAILURE_CASES: readonly RecipeImportError[] = ['not-found', 'blocked', 'unreachable'];
  for (const error of FETCH_FAILURE_CASES) {
    it(`returns and remembers a '${error}' fetch failure`, async () => {
      const cache = new TestRecipeCache();
      const key = recipeKey(PAGE_URL);
      const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'failed', error } });

      const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 5_000 });

      expect(result).toEqual({ ok: false, error });
      expect(cache.failures.get(key)).toEqual({ error, failedAt: 5_000 });
    });
  }

  it("returns and remembers 'not-a-recipe' when the page has no Recipe JSON-LD", async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: NOT_A_RECIPE_HTML } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 5_000 });

    expect(result).toEqual({ ok: false, error: 'not-a-recipe' });
    expect(cache.failures.get(key)).toEqual({ error: 'not-a-recipe', failedAt: 5_000 });
  });

  it("returns and remembers 'incomplete-recipe' when the Recipe node has no ingredients", async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: INCOMPLETE_RECIPE_HTML } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 5_000 });

    expect(result).toEqual({ ok: false, error: 'incomplete-recipe' });
    expect(cache.failures.get(key)).toEqual({ error: 'incomplete-recipe', failedAt: 5_000 });
  });

  // AC#2 lists "an undecodable cached doc is treated as a miss" as its own behaviour, but from
  // importRecipe's side there is nothing to distinguish: RecipeCache.getRecipe/getFailure return
  // Promise<... | null>, so a doc that failed to decode and a key nothing was ever stored under are
  // the identical null to this function - there's no separate signal it could key a different
  // behaviour on. This test therefore exercises the exact same path as the plain-miss cache-hit-less
  // case above; it doesn't add coverage beyond it. Decoding a stored doc into that null (or not) is
  // the provider's job, covered in TASK-74.4.6, not here.
  it('a cache returning null for an undecodable recipe doc is treated as a miss and fetches', async () => {
    const cache = new TestRecipeCache(); // no entry for key: getRecipe resolves null, same as an undecodable doc would
    const { fetchPage, calls } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(calls).toEqual([PAGE_URL]);
    expect(result.ok).toBe(true);
  });

  it('the ok result carries recipeId = recipeKey(normalised) and sourceUrl = normalised', async () => {
    const cache = new TestRecipeCache();
    const raw = 'https://Recipe.invalid/Soup/?utm_source=x&b=2&a=1';
    const normalised = normalise(raw);
    const { fetchPage } = makeFetchPage({ [normalised]: { kind: 'page', html: recipeHtml('photo.jpg') } });

    const result = await importRecipe(raw, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.recipeId).toBe(recipeKey(normalised));
    expect(result.value.sourceUrl).toBe(normalised);
  });

  // TASK-74 AC#10 says parseRecipeJsonLd(cached source jsonLd) equals the cached recipe content.
  // resolveImage's base is `cachedSource.url` (the normalised URL), which is exactly what is
  // persisted, so re-resolving the re-parsed image against it reproduces the cached recipe's image
  // for any URL, not just this fixture.
  it('re-parsing the cached source jsonLd, with the image re-resolved, equals the cached recipe (TASK-74 AC#10)', async () => {
    const cache = new TestRecipeCache();
    const key = recipeKey(PAGE_URL);
    const html = recipeHtml('photo.jpg');
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html } });

    await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    const cachedRecipe = cache.recipes.get(key)!;
    const cachedSource = cache.sources.get(key)!;
    const reparsed = parseRecipeJsonLd(cachedSource.jsonLd);
    if (!reparsed.ok) throw new Error('expected the stored jsonLd to re-parse');

    const { recipeId: _recipeId, sourceUrl: _sourceUrl, ...cachedContent } = cachedRecipe.recipe;
    const rebuilt = { ...reparsed.value, image: resolveImage(reparsed.value.image, cachedSource.url) };
    expect(rebuilt).toEqual(cachedContent);
  });

  // Same invariant (TASK-74 AC#10), but with a request URL that needed normalisation (a trailing
  // slash and a tracking param), to show the rebuild holds generally and not only for an
  // already-normalised fixture: the resolution base is `cachedSource.url`, the normalised URL,
  // which is exactly what the cache persists.
  it('re-parsing the cached source jsonLd reproduces the cached image for a trailing-slash, utm-tagged request (TASK-74 AC#10)', async () => {
    const cache = new TestRecipeCache();
    const rawUrl = 'https://recipe.invalid/recipes/soup/?utm_source=newsletter';
    const requestedKey = normalise(rawUrl);
    const key = recipeKey(requestedKey);
    const html = recipeHtml('images/soup.jpg');
    const { fetchPage } = makeFetchPage({ [requestedKey]: { kind: 'page', html } });

    await importRecipe(rawUrl, { fetchPage, cache, now: () => 1_000 });

    const cachedRecipe = cache.recipes.get(key)!;
    const cachedSource = cache.sources.get(key)!;
    const reparsed = parseRecipeJsonLd(cachedSource.jsonLd);
    if (!reparsed.ok) throw new Error('expected the stored jsonLd to re-parse');

    const { recipeId: _recipeId, sourceUrl: _sourceUrl, ...cachedContent } = cachedRecipe.recipe;
    const rebuilt = { ...reparsed.value, image: resolveImage(reparsed.value.image, cachedSource.url) };
    expect(rebuilt).toEqual(cachedContent);
  });

  it('resolves a relative image against the requested page URL', async () => {
    const cache = new TestRecipeCache();
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('images/soup.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.image).toBe('https://recipe.invalid/images/soup.jpg');
  });

  // normaliseRecipeUrl strips every trailing slash (contract §9 step 4), so a page URL ending in
  // '/' (WordPress-style permalinks do this routinely) normalises to a different, slash-less
  // request/cache-key form. Per the contract, the image resolves against that normalised URL (the
  // same URL that was actually fetched), which moves resolution up one path segment relative to the
  // slashed request. This is the documented contract behaviour, not a bug: see import-recipe.ts's
  // resolveImage doc comment and the open contract question in this task's notes about whether the
  // resolution base should instead be the page's actual final URL (which FetchedPage does not carry
  // today).
  it('resolves a relative image against the normalised, slash-stripped page URL', async () => {
    const cache = new TestRecipeCache();
    const trailingSlashPageUrl = 'https://recipe.invalid/recipes/soup/';
    const requestedKey = normalise(trailingSlashPageUrl); // 'https://recipe.invalid/recipes/soup' (slash stripped)
    const { fetchPage } = makeFetchPage({ [requestedKey]: { kind: 'page', html: recipeHtml('images/soup.jpg') } });

    const result = await importRecipe(trailingSlashPageUrl, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.image).toBe('https://recipe.invalid/recipes/images/soup.jpg');
  });

  it('an absolute non-http(s) image becomes null', async () => {
    const cache = new TestRecipeCache();
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('ftp://files.invalid/soup.jpg') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.image).toBeNull();
  });

  it('a data: image URI becomes null', async () => {
    const cache = new TestRecipeCache();
    const { fetchPage } = makeFetchPage({ [PAGE_URL]: { kind: 'page', html: recipeHtml('data:image/png;base64,AAAA') } });

    const result = await importRecipe(PAGE_URL, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.image).toBeNull();
  });

  // Per WHATWG URL resolution, new URL('', base) returns base itself, which is the page URL, not an
  // image - an unguarded empty image would otherwise write the page's own URL into the recipe's
  // image field.
  it('an empty image string becomes null (the page URL is not an image)', async () => {
    const cache = new TestRecipeCache();
    const taggedUrl = `${PAGE_URL}?utm_source=newsletter`;
    const requestedKey = normalise(taggedUrl);
    const { fetchPage } = makeFetchPage({ [requestedKey]: { kind: 'page', html: recipeHtml('') } });

    const result = await importRecipe(taggedUrl, { fetchPage, cache, now: () => 1_000 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value.image).toBeNull();
  });

  it('nothing thrown or returned contains the URL text, even on failure', async () => {
    const cache = new TestRecipeCache();
    const secretUrl = 'https://recipe.invalid/a-very-specific-path-token';
    const { fetchPage } = makeFetchPage({ [secretUrl]: { kind: 'failed', error: 'unreachable' } });

    const result = await importRecipe(secretUrl, { fetchPage, cache, now: () => 1_000 });

    expect(JSON.stringify(result)).not.toContain('a-very-specific-path-token');
  });
});
