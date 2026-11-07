// importRecipe: the server's one entry point for turning a link into a parsed recipe (decision-15,
// contract TASK-74 §10). Impure: it orders cache reads, a network fetch and cache writes, so it
// lives outside pure/. The actual fetching, parsing and caching are injected, so this file holds
// only the sequencing.
import { err, ok } from '@grocs/core';
import type { ParsedRecipe, RecipeImportError, Result } from '@grocs/core';
import type { FetchPage } from './fetch-page.ts';
import { normaliseRecipeUrl } from './pure/normalise-url.ts';
import { PARSER_VERSION, parseRecipePage } from './pure/recipe-schema.ts';
import { recipeKey } from './recipe-key.ts';
import type { CachedFailure, CachedRecipe, CachedSource, RecipeCache } from './recipe-cache.ts';

/** How long a remembered failure is returned without a new fetch (contract §10). */
export const FAILURE_MEMORY_MS = 24 * 60 * 60 * 1000;

export interface RecipeImportDeps {
  readonly fetchPage: FetchPage;
  readonly cache: RecipeCache;
  readonly now: () => number;
}

/**
 * Resolves `image` (as written in the page's JSON-LD) against `pageUrl`, contract amendment
 * 2026-11-07. A relative image resolves to an absolute URL; a bare `data:` URI or anything whose
 * resolved scheme isn't http(s) becomes null; an image that cannot be resolved at all (e.g. because
 * `pageUrl` is somehow not itself a valid URL) also becomes null. `image` is passed back unresolved
 * by json-ld.ts/recipe-schema.ts; this is the only place in the import that turns it absolute.
 *
 * Note for the contract owner: the amendment says to resolve against "the fetched page's final
 * URL", but FetchedPage (contract §10) carries only `{ kind: 'page'; html }` - no final URL after
 * any redirects the fetcher followed internally. The only URL available here is the normalised
 * request URL, so that is what is used. This is correct whenever the page was reached directly;
 * a relative image on a page reached through a cross-origin redirect would resolve against the
 * pre-redirect origin instead of where the page actually ended up.
 */
function resolveImage(image: string | null, pageUrl: string): string | null {
  if (image === null) return null;
  try {
    const resolved = new URL(image, pageUrl);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.href : null;
  } catch {
    return null;
  }
}

/**
 * Runs the import in contract §10's fixed order: normalise, key, a cached recipe, a remembered
 * failure, fetch, parse, save. `invalid-url` stops before any cache access, so it is never cached.
 * Never throws, and no URL or page content appears in anything it returns.
 */
export async function importRecipe(url: string, deps: RecipeImportDeps): Promise<Result<ParsedRecipe, RecipeImportError>> {
  const normalised = normaliseRecipeUrl(url);
  if (!normalised.ok) return err(normalised.error);
  const pageUrl = normalised.value;
  const key = recipeKey(pageUrl);

  const cachedRecipe = await deps.cache.getRecipe(key);
  if (cachedRecipe !== null) return ok(cachedRecipe.recipe);

  const failure = await deps.cache.getFailure(key);
  if (failure !== null && deps.now() - failure.failedAt < FAILURE_MEMORY_MS) {
    return err(failure.error);
  }

  const fetched = await deps.fetchPage(pageUrl);
  if (fetched.kind === 'failed') {
    const saved: CachedFailure = { error: fetched.error, failedAt: deps.now() };
    await deps.cache.saveFailure(key, saved);
    return err(fetched.error);
  }

  const parsed = parseRecipePage(fetched.html);
  if (!parsed.ok) {
    const saved: CachedFailure = { error: parsed.error, failedAt: deps.now() };
    await deps.cache.saveFailure(key, saved);
    return err(parsed.error);
  }

  const recipe: ParsedRecipe = {
    ...parsed.value.content,
    image: resolveImage(parsed.value.content.image, pageUrl),
    recipeId: key,
    sourceUrl: pageUrl,
  };
  const cachedRecipeDoc: CachedRecipe = { url: pageUrl, recipe, parserVersion: PARSER_VERSION, fetchedAt: deps.now() };
  const cachedSourceDoc: CachedSource = { url: pageUrl, jsonLd: parsed.value.jsonLd, fetchedAt: deps.now() };
  await deps.cache.saveRecipe(key, cachedRecipeDoc, cachedSourceDoc);
  return ok(recipe);
}
