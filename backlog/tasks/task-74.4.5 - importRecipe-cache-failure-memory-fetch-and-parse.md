---
id: TASK-74.4.5
title: 'importRecipe: cache, failure memory, fetch and parse'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:06'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.3.6
  - TASK-74.4.4
  - TASK-74.4.3
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §10: recipe-key.ts, recipe-cache.ts (the RecipeCache interface and doc types, not the Firestore class) and import-recipe.ts. The order of operations is fixed by the contract. It is unit-tested with an in-memory RecipeCache defined in the test and a fake FetchPage that serves fixtures, so no site is fetched. Covers TASK-74.4 AC#2, #3, #4 and #8 at the unit level, and TASK-74 AC#9, #10 and #11.

Split key: providers-recipe-import. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 importRecipe follows contract §10: normalise, then key, then cache hit, then a failure within 24 h, then fetch, then parse, then save. invalid-url is never cached
- [ ] #2 Unit tests: a hit does not call fetchPage; a miss fetches once and saves both recipe and source; a utm variant hits the same key; a failure is remembered (a second call within 24 h makes no fetch and returns the same error, and after now moves past 24 h it fetches again); a later success clears the failure; each error kind (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe, invalid-url) is returned as err; a cache returning null for an undecodable doc is treated as a miss; the result carries recipeId = recipeKey(normalised) and sourceUrl = normalised
- [ ] #3 Re-parse: parseRecipeJsonLd(cached source jsonLd) equals the cached recipe content (TASK-74 AC#10)
- [ ] #4 Nothing throws or logs with URL text. Exports are added to providers-server/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and the unit tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. recipe-key.ts (+ .test.ts): recipeKey(normalisedUrl) = sha256 hex via node:crypto createHash, over the UTF-8 bytes of the string as given (no re-normalisation here - the caller already normalised). Test: same input -> same key, different input -> different key, hex-lowercase shape, a utm-stripped variant of the same URL (after normaliseRecipeUrl) gives the same key as the canonical form.
2. recipe-cache.ts: the RecipeCache interface and CachedRecipe/CachedSource/CachedFailure types exactly as contract §10 (no Firestore implementation - that is TASK-74.4.6). Pure types/interface only, no logic, so no .test.ts is needed for it (nothing executable to test; the interface is exercised through import-recipe.test.ts's in-memory implementation).
3. import-recipe.ts: FAILURE_MEMORY_MS, RecipeImportDeps and importRecipe(url, deps), following contract §10's eight steps literally: normalise (err on invalid-url, no cache write) -> key -> cache hit returns cachedRecipe.recipe as-is (it already carries recipeId/sourceUrl from when it was saved) -> a failure with now-failedAt < FAILURE_MEMORY_MS returns its error -> fetchPage (a 'failed' result saves the failure and returns its error) -> parseRecipePage (an err saves the failure and returns it) -> on success, resolve a relative image against the normalised URL with `new URL(image, normalised)`, keep only if the resolved protocol is http(s) else null (contract amendment 2026-11-07), build `{...content, image, recipeId: key, sourceUrl: normalised}`, saveRecipe(key, cachedRecipe, cachedSource) (which the contract says also deletes the failure), return ok(parsedRecipe). Nothing in the function throws or includes URL text in a thrown value; errors are only ever the fixed RecipeImportError strings.
4. import-recipe.test.ts: an in-memory RecipeCache (a Map-backed class defined in the test, per the task description) and a fake FetchPage. Cases: a cache hit skips fetchPage entirely; a miss fetches once and saves both recipe and source; a utm-tracking variant of a cached URL hits the same key (no fetch); a remembered failure within 24h makes no fetch and returns the same error; after advancing the injected `now` past 24h the same URL fetches again; a later success clears the failure (saveRecipe deletes it - asserted via the in-memory cache's getFailure returning null after); every error kind (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe, invalid-url) is returned as err, with invalid-url never reaching the cache (no key computed/no cache call); a cache whose getRecipe/getFailure returns null for an undecodable doc is treated as a miss (fetches as normal); the ok result carries recipeId = recipeKey(normalised) and sourceUrl = normalised; re-parsing the cached source's jsonLd with parseRecipeJsonLd equals the cached recipe content (AC#3, TASK-74 AC#10); a relative image resolves against the normalised page URL and an unresolvable/non-http(s) one becomes null.
5. Export from packages/providers-server/src/index.ts: importRecipe (and its alias `importRecipeOnServer` for the callable), recipeKey, FAILURE_MEMORY_MS, and the types RecipeImportDeps, RecipeCache, CachedRecipe, CachedSource, CachedFailure. Not exporting FirestoreRecipeCache (TASK-74.4.6, doesn't exist yet) or createLiveFetchPage/createGuardedLookup/normaliseRecipeUrl/PARSER_VERSION/parseRecipeJsonLd here - those were explicitly left to "TASK-74.4.5 onward" by TASK-74.4.4's notes, but belong to fetch-page.ts/normalise-url.ts/recipe-schema.ts which are not in this task's file list; re-exporting them is this task's business only insofar as import-recipe.ts needs their types internally, so I will re-export the full contract §10 list except FirestoreRecipeCache, to unblock later tasks without touching those other files.
6. Run the unit vitest project and repo-wide typecheck; append proof to the task notes.

### Risks
- The contract's step ordering (hit -> failure-memory -> fetch -> parse -> save) must be followed literally, including that invalid-url never computes a key or touches the cache.
- The image-resolution amendment is new (added to the contract after this task was split); covered by two explicit tests (relative-resolves, unresolvable-becomes-null).
- Deciding which exports belong in index.ts beyond my own files' symbols touches other tasks' surface; if review disagrees with exporting fetch-page/normalise-url/recipe-schema symbols here, that is a cheap follow-up, not a redesign.
- Stay inside packages/providers-server/src/recipe/{recipe-key,recipe-cache,import-recipe}.ts(+test) and index.ts. A needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion (AC#1-#4) is shown by a named test in import-recipe.test.ts or recipe-key.test.ts, plus `pnpm exec vitest run --project unit packages/providers-` and `pnpm -s typecheck` output pasted into the task notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Contract amendment 2026-11-07 (orchestrator): importRecipe resolves a relative image against the fetched page's final URL with new URL(image, pageUrl), keeps it only if http(s), else null - see TASK-74's plan, Amendments. Include a test for a relative image and for one that can't be resolved.

## Implementation

packages/providers-server/src/recipe/{recipe-key,recipe-cache,import-recipe}.ts (+ matching .test.ts beside recipe-key and import-recipe; recipe-cache.ts is types/interface only - no executable logic, so no .test.ts), per contract TASK-74 §10.

- recipe-key.ts: recipeKey(normalisedUrl) = sha256 hex (node:crypto createHash) of the UTF-8 bytes of the string as given; the caller (importRecipe) is responsible for normalising first.
- recipe-cache.ts: CachedRecipe/CachedSource/CachedFailure and the RecipeCache interface exactly as contract §10 (no Firestore implementation - TASK-74.4.6's job).
- import-recipe.ts: FAILURE_MEMORY_MS (24h), RecipeImportDeps, importRecipe(url, deps) runs contract §10's 8 steps literally: normalise (invalid-url stops here, no cache write) -> key -> a cached recipe returns it as-is (it already carries recipeId/sourceUrl from when it was saved, so no parserVersion staleness check is added - the contract has none) -> a failure with now-failedAt < FAILURE_MEMORY_MS returns its error -> fetchPage (a 'failed' result calls saveFailure and returns the error) -> parseRecipePage (an err calls saveFailure and returns it) -> on success, resolve content.image per the 2026-11-07 amendment (new URL(image, pageUrl), kept only if the resolved scheme is http(s), else null), build {...content, image, recipeId: key, sourceUrl: normalised}, saveRecipe(key, recipe, source) (the interface's own contract is that this also deletes the failure - proved by a test against the in-memory double, not by import-recipe itself), return ok. Nothing is thrown; every error is one of the fixed RecipeImportError strings; no URL or HTML ever appears in a returned or thrown value.

Note for the contract owner (not a blocker, flagging as instructed): the amendment says to resolve the image against "the fetched page's final URL", but FetchedPage (contract §10) is `{ kind: 'page'; html }` - it carries no final URL after any redirects the fetcher (TASK-74.4.4's createLiveFetchPage) followed internally. The only URL available inside importRecipe is the normalised request URL, so that's what resolveImage uses (documented in a comment on the function). This is correct for every direct page load; a relative image on a page reached through a cross-origin redirect would resolve against the pre-redirect origin instead of wherever the page actually landed. Widening FetchedPage to carry a final URL would reopen TASK-74.4.4 (already built and reviewed) - left for the contract owner to decide, not actioned here.

index.ts: re-exports the full contract §10 list except FirestoreRecipeCache (TASK-74.4.6, doesn't exist yet) - importRecipe (+ alias importRecipeOnServer), createLiveFetchPage, createGuardedLookup, recipeKey, normaliseRecipeUrl, PARSER_VERSION, parseRecipeJsonLd, FAILURE_MEMORY_MS, and the named types. TASK-74.4.4's notes explicitly left this to "TASK-74.4.5 onward" since deep imports are forbidden and index.ts previously exported only kitchen-store.ts.

## Proof

AC#1 (order of operations, invalid-url never cached): import-recipe.test.ts - "'invalid-url' is never cached (no key computed, cache and fetchPage both untouched)", plus the ordering is exercised end-to-end by every other case (hit short-circuits before failure/fetch; failure short-circuits before fetch; fetch failure and parse failure both save a failure and never call saveRecipe).

AC#2 (24 tests, import-recipe.test.ts + recipe-key.test.ts): a hit skips fetchPage; a miss fetches once and saves both recipe and source; a utm variant hits the same key; a remembered failure is returned with no fetch at `failedAt + FAILURE_MEMORY_MS - 1` (the discriminating boundary), fetches again exactly at `failedAt + FAILURE_MEMORY_MS` and well past it; a later success clears the failure (asserted via getFailure after); every error kind (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe, invalid-url) returned as err; a cache resolving null for an unseeded key (standing in for an undecodable doc, per the interface's own "never thrown" contract) is treated as a miss and fetches; the ok result's recipeId = recipeKey(normalised) and sourceUrl = normalised, proved against a URL with case, trailing slash, utm param and query reordering all needing normalisation first.

AC#3 (re-parse invariant, TASK-74 AC#10): "re-parsing the cached source jsonLd equals the cached recipe content" - parseRecipeJsonLd(cache.sources.get(key).jsonLd) deep-equals parseRecipePage(html).content.

AC#4 (no throw/log, exports, typecheck+tests green): grepped the four new/changed files for `console.` - no matches. A JSON.stringify(result)-does-not-contain-URL-text test (same proof pattern as TASK-74.4.4). Exports added to packages/providers-server/src/index.ts as above.

$ mise exec -- pnpm exec vitest run --project unit packages/providers-
 Test Files  17 passed (17)
      Tests  282 passed (282)

$ mise exec -- pnpm exec vitest run --project unit packages/providers-server/src/recipe/import-recipe.test.ts packages/providers-server/src/recipe/recipe-key.test.ts --reporter=verbose
 Test Files  2 passed (2)
      Tests  24 passed (24)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no output, exit 0)

Modified/added files: packages/providers-server/src/recipe/recipe-key.ts, packages/providers-server/src/recipe/recipe-key.test.ts, packages/providers-server/src/recipe/recipe-cache.ts, packages/providers-server/src/recipe/import-recipe.ts, packages/providers-server/src/recipe/import-recipe.test.ts, packages/providers-server/src/index.ts

Review findings addressed (2026-11-07, round 2):

1. resolveImage trailing-slash bug (fixed): resolveImage's base is now the trimmed *raw request
   URL* (`requestedUrl = url.trim()`), not the normalised one. normaliseRecipeUrl strips every
   trailing slash (contract §9 step 4), which was moving `new URL(image, base)`'s resolution up one
   directory whenever the page's own address ended in '/'. No contract change was needed: fetchPage
   still receives the normalised URL (pageUrl) exactly as before, and FetchedPage is unchanged - only
   the base passed into the local resolveImage() changed. Covered by a new test with a trailing-slash
   page URL and a relative image, verifying the image resolves under the page's own directory.

2. New contract-owner finding (not in the review, found while fixing #1): the resolution base (the
   raw request URL) is not part of the cache key and is not persisted anywhere. recipeKey is computed
   from the normalised URL, so two different raw URLs that normalise to the same key (one with a
   trailing slash, one without; one with a tracking param, one without; different host casing) will
   both hit the same cached recipe doc, but whichever is fetched *first* determines the image that
   gets cached and returned to both. The cached recipe's image cannot be reconstructed from the
   cached source (jsonLd) plus the stored url alone, because the raw form that produced it isn't
   stored. This is a real (if narrow) trade-off of the trailing-slash fix; flagging it for the
   contract owner rather than shipping it silently.

3. AC#10 test (fixed, and limit documented): TASK-74 AC#10 ("parseRecipeJsonLd(cached source jsonLd)
   equals the cached recipe content") no longer holds in general after the 2026-11-07 image
   amendment, and not only because an extra resolution step is needed. The test now rebuilds the
   recipe from the re-parsed jsonLd plus `resolveImage(reparsed.value.image, cachedSource.url)` and
   compares field-for-field against the cached recipe (recipeId/sourceUrl excluded, since those are
   recomputed from the key/url rather than reproduced by re-parsing). That rebuild only reproduces
   the cached image when the raw request URL and its normalised form are identical (true of the
   fixture used, PAGE_URL has no trailing slash/tracking params/casing differences) - per finding #2,
   it is not true in general (see the trailing-slash test, which caches an image this rebuild could
   not reproduce for that URL). Recorded in the test's comment for whoever next touches this.

4. Undecodable-doc test (addressed per the non-blocking option offered): from importRecipe's side, a
   doc that failed to decode and a key nothing was ever stored under are the identical
   `Promise<... | null>` - there is no signal available to this function to tell them apart. Updated
   the test's comment to say so plainly rather than claim separate coverage; it exercises the same
   path as the plain-miss test. Decoding itself is TASK-74.4.6's concern (the Firestore provider).

5. Single deps.now() (fixed): `fetchedAt` is now computed once into a local and reused for both
   cachedRecipeDoc and cachedSourceDoc, so saveRecipe's one batch write (contract §10) can no longer
   record two different fetchedAt values for the two docs.

6. Scope beyond the review (flagged, not asked for): added `image === '' -> null` to resolveImage.
   Per WHATWG URL resolution, `new URL('', base)` returns `base` itself; since the base is now the
   raw request URL rather than the normalised/tracking-stripped one (per fix #1), an unresolved empty
   `image` string (recipe-schema.ts's resolveImageEntry passes a literal '' through unchanged, it
   does not coerce it to null) would otherwise have written the raw request URL - tracking query
   params included - into the cached recipe's image field. Added a test with a tracking-tagged
   request URL and an empty image, asserting null rather than the leaked URL. This is my own addition
   on top of what the review asked for; flagging it explicitly in case the contract owner wants it
   handled differently (e.g. stripped search/hash from the base instead of rejecting empty images
   outright - a fragment-only or query-only image would still inherit the raw query the same way;
   not fixed here as it wasn't part of the reported findings and no realistic recipe site was seen to
   emit one).

Checks run after all fixes, from the worktree:
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> 17 test files, 284 tests,
  all passing (22 in import-recipe.test.ts, up from 20: the trailing-slash and empty-image tests).
- `mise exec -- pnpm -s typecheck` -> clean (`tsc --noEmit`, no output).
<!-- SECTION:NOTES:END -->
