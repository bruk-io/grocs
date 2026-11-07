---
id: TASK-74.4.6
title: Firestore recipe cache and its emulator tests
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:45'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.4.5
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §10 and §11: FirestoreRecipeCache over Admin Firestore, with the three top-level collections. jsonLd is stored as a JSON string because Firestore cannot hold nested arrays, which departs from decision-15's 'raw object' wording, so the deviation is recorded. Emulator tests use adminFirestore() and a fake FetchPage serving fixtures. Every test uses a unique recipe.invalid URL, because the cache is shared and top-level. Covers TASK-74.4 AC#3 and AC#6, and decision-15's 'cache hit, miss, failure memory and each error'.

Split key: providers-recipe-cache. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FirestoreRecipeCache implements RecipeCache. saveRecipe writes recipes/{key} and recipeSources/{key} and deletes recipeFailures/{key} in one batch, with the doc shapes in contract §11. An undecodable doc reads as null
- [ ] #2 recipe-cache.emulator.test.ts runs importRecipe with FirestoreRecipeCache and covers: a miss stores both docs (read back raw, the recipe doc has no jsonLd and the source doc has no recipe); a hit makes no fetch; failure memory with an injected clock moved past 24 h; each error kind through the fake FetchPage (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe), each stored in recipeFailures; invalid-url stores nothing; a source re-parse equals the stored recipe
- [ ] #3 Implementation notes on TASK-74.4 record the JSON-string storage of recipeSources.jsonLd as a deviation from decision-15, with the nested-array reason
- [ ] #4 Exported from providers-server/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide, and orch-emulator-suite confirms pnpm test:emulator
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. packages/providers-server/src/recipe/firestore-recipe-cache.ts: FirestoreRecipeCache implements
   RecipeCache (contract §11). getRecipe/getSource decode the stored doc (recipe as-is; jsonLd
   JSON.parse'd back from the stored string) and return null on any decode failure (try/catch),
   never throwing. getFailure likewise. saveRecipe writes recipes/{key} and recipeSources/{key} and
   deletes recipeFailures/{key} in one batch() (so a reader never sees a recipe doc without its
   source, matching the existing saveFailure/TestRecipeCache precedent in import-recipe.test.ts).
   saveFailure sets recipeFailures/{key}. Admin SDK only (constructor(db: Firestore)), following
   KitchenStore's shape in kitchen-store.ts.
2. Export FirestoreRecipeCache from packages/providers-server/src/index.ts (contract's export list
   already names it as a type-only re-export placeholder: add the class export).
3. packages/providers-server/src/recipe/recipe-cache.emulator.test.ts: adminFirestore() (from
   firebase/emulator-client.ts) + a fake FetchPage serving fixtures, running importRecipe with
   FirestoreRecipeCache as the cache. Every test uses a unique recipe.invalid URL (the cache is
   shared/top-level across the whole emulator run). Cases from AC#2:
   - a miss stores both docs: read back with adminFirestore() directly; the recipes/{key} doc has
     no jsonLd field and the recipeSources/{key} doc has no recipe field.
   - a hit (pre-seeded recipes/{key} doc) makes no fetch (assert the fake's call list is empty).
   - failure memory: saveFailure once, then a second importRecipe call with an injected `now` moved
     past FAILURE_MEMORY_MS (24h) refetches instead of returning the remembered error.
   - each error kind through the fake FetchPage (not-found, blocked, unreachable via fetch result;
     not-a-recipe and incomplete-recipe via page HTML), each ends up stored in recipeFailures/{key}.
   - invalid-url (e.g. 'not a url') stores nothing in any of the three collections.
   - a source re-parse (JSON.parse the stored recipeSources/{key}.jsonLd then parseRecipeJsonLd it)
     equals the stored recipe's content.
4. Add implementation notes to TASK-74.4 recording the JSON-string storage of recipeSources.jsonLd
   as a decision-15 deviation (nested-array reason), per AC#3 - contract §11 already states this;
   the note makes it discoverable from TASK-74.4 directly.
5. Run pnpm -s typecheck (repo-wide) and pnpm test:emulator (providers-server + whole suite), record
   output in this task's notes.

### Risks
- Firestore cannot store nested arrays (recipeInstructions sections nest them), hence jsonLd is
  stored as a JSON string, not the raw object - this is a documented contract deviation (§11), not
  a new one I'm introducing.
- The cache is a shared, top-level Firestore collection reused across the whole emulator run, so
  every test must pick a URL (hence key) no other test uses, or tests will interfere.
- Staying inside packages/providers-server/** only; no other layer's files are touched. A needed
  contract change would go in this task's notes and stop the work (decision-3 mediation) - not
  expected here, the contract is explicit enough to implement directly.

### Proof
- `mise exec -- pnpm -s typecheck` passes repo-wide.
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` passes (unit scope; the
  new file is an emulator test so it's excluded from this project, but existing providers-server
  unit tests must still pass).
- `pnpm test:emulator` (asked of the orchestrator per AC#4's "orch-emulator-suite") covers
  recipe-cache.emulator.test.ts; its output recorded in the task notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built: packages/providers-server/src/recipe/firestore-recipe-cache.ts (FirestoreRecipeCache),
packages/providers-server/src/recipe/recipe-cache.emulator.test.ts, and the export from
packages/providers-server/src/index.ts.

AC#1: FirestoreRecipeCache.saveRecipe writes recipes/{key} and recipeSources/{key} and deletes
recipeFailures/{key} in one batch().commit(). Each getter (getRecipe/getSource/getFailure)
shape-checks the raw doc field by field (schemaVersion, string/number fields, jsonLd parses to a
non-null non-array object) and returns null for anything that does not match exactly - proved by
the "an undecodable doc reads as null" test, which seeds a malformed doc at all three paths
(recipes, recipeSources, recipeFailures) and asserts null from each getter, not a throw.

AC#2 (pnpm test:emulator, full run, this worktree):
  Test Files  1 failed | 9 passed (10)
       Tests  4 failed | 139 passed (143)
The 1 failing file is packages/providers-firebase/src/recipe-importer.emulator.test.ts (4 tests,
all "FirebaseError: not-found [404]" calling the importRecipe callable) - that callable is
TASK-74.4.7, not yet built in this worktree (apps/functions' loaded functions list has no
importRecipe), so its failure is expected and outside this task. recipe-cache.emulator.test.ts
itself is among the 9 passed files, covering every case AC#2 lists: a miss stores both docs (read
back raw: no jsonLd on the recipe doc, no recipe on the source doc); a hit makes no fetch; failure
memory within the 24h window answers with no fetch, and past it refetches and deletes the failure
doc; each error kind (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe) ends up in
recipeFailures; invalid-url stores nothing and never calls fetchPage or the cache; a source
re-parse (JSON.parse the stored jsonLd, then parseRecipeJsonLd) equals the stored recipe's content
(the fixture's image is absent, so resolveImage's absolute-URL step, applied once in import-recipe.ts
before storing, does not need to be replayed in the comparison - noted in the test). Every test uses
its own unique recipe.invalid/* URL since the cache is shared and top-level.

AC#3: the decision-15 deviation (recipeSources.jsonLd stored as a JSON string, nested-array
reason) is recorded on the parent, TASK-74.4 (--append-notes), since §11 of the contract already
states it there.

AC#4 (`mise exec -- pnpm -s typecheck`, repo-wide):
  $ tsc --noEmit
  (no errors)
`mise exec -- pnpm exec vitest run --project unit packages/providers-`:
  Test Files  17 passed (17)
       Tests  294 passed (294)
FirestoreRecipeCache is exported from packages/providers-server/src/index.ts.

Review findings addressed (commit 26e24a0):

1. invalid-url test: wrapped FirestoreRecipeCache in a recording RecipeCache (logs every
   getRecipe/getSource/getFailure/saveRecipe/saveFailure call) and asserted the log is empty,
   not just that fetchPage was never called and the result matched. Now the test actually fails
   if importRecipe/any cache implementation were to write under a fixed key for invalid-url.

2. Added "getSource round-trips a nested-array jsonLd shape (HowToSection.itemListElement)":
   saves a CachedSource whose jsonLd nests itemListElement arrays inside the outer
   recipeInstructions array, asserts the raw recipeSources doc stores jsonLd as a string, and
   that cache.getSource(key) deep-equals the original jsonLd object. This is the one case §11's
   deviation note exists for and previously had no test writing that shape to Firestore.

3. firestore-recipe-cache.ts: replaced the hand-written `ReadonlySet<string>` copy of
   RecipeImportError with `const RECIPE_IMPORT_ERRORS = {...} as const satisfies
   Record<RecipeImportError, true>`, checked with `Object.hasOwn`. A new RecipeImportError kind
   added to core without a matching key here is now a compile error instead of a silent miss in
   decodeFailureDoc.

4. "a source re-parse equals the stored recipe": now reads back recipes/{key} from Firestore and
   compares the re-parsed jsonLd against that stored doc's `recipe` field (minus recipeId/
   sourceUrl), instead of comparing against importRecipe's in-memory result.value. Proves the
   on-disk recipes/{key} and recipeSources/{key} agree after the round trip.

Checks run from the worktree:
- `mise exec -- pnpm exec vitest run --project unit packages/providers-`: 17 files / 294 tests
  passed.
- `mise exec -- pnpm -s typecheck`: clean (tsc --noEmit, no errors).
- `mise exec -- pnpm exec firebase emulators:exec --only firestore,auth,functions --project
  demo-grocs "pnpm exec vitest run --project emulator packages/providers-server/src/recipe/recipe-cache.emulator.test.ts"`:
  1 file / 12 tests passed (was 10 tests before adding the nested-array getSource test).
<!-- SECTION:NOTES:END -->
