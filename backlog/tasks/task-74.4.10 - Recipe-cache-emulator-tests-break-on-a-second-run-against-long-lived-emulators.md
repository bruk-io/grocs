---
id: TASK-74.4.10
title: Recipe cache emulator tests break on a second run against long-lived emulators
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 04:50'
updated_date: '2026-11-07 05:06'
labels:
  - size-2
  - layer-providers
dependencies: []
parent_task_id: TASK-74.4
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
recipe-cache.emulator.test.ts uses fixed URLs (for example fsrc-failure-memory, fsrc-miss) in the shared top-level recipes, recipeSources and recipeFailures collections. In a fresh emulators:exec run that is fine, but against a long-lived pnpm emulators instance (how TASK-74.4.8's local proof runs) a second run finds the first run's docs: the failure-memory test's first import returns ok and fails, and the miss test silently becomes a cache hit. Two fixtures also store a recipe with ingredients: [], a shape importRecipe can never write. Found by reviewer-providers on TASK-74.4.6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Each test in recipe-cache.emulator.test.ts uses URLs unique to the run as well as the test (or clears its keys first), and running the emulator project twice against one long-lived emulator instance passes both times
- [x] #2 No fixture in that file stores a recipe with no ingredients or no steps
- [x] #3 The providers unit tests, typecheck and pnpm test:emulator pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add a module-level run-unique id (crypto.randomUUID(), matching the Date.now()-based pattern already used in google-auth.emulator.test.ts) to packages/providers-server/src/recipe/recipe-cache.emulator.test.ts, and fold it into every fixed URL in the file (fsrc-miss, fsrc-hit, fsrc-failure-memory, fsrc-error-*, fsrc-reparse, fsrc-nested-sections, fsrc-undecodable) so a second run against a long-lived emulator never finds a prior run's docs at the same key.
2. Replace the two fixtures that store ingredients: [] (the "a hit" test's directly-seeded doc, and the nested-sections test's cache.saveRecipe call) with a non-empty ParsedIngredient list, matching the shape importRecipe actually produces.
3. Run providers unit tests and typecheck; run pnpm test:emulator twice in a row against one emulator instance to prove the fix (the actual bug scenario), then once more as a final regression check.
### Risks
- Changing the URLs changes the recipeKey (sha256 of the normalised URL) for every fixture, so the "an undecodable doc" test and the nested-sections test, which hand-seed docs at a specific key, must derive their key from the same new normalise()/recipeKey() call already in use rather than a stale literal.
- Running two full emulator cycles back-to-back to prove criterion #1 costs time (Java-backed emulator startup); doing it against one already-running instance (pnpm emulators) is what the bug report asks for, so that is the real proof, not two separate emulators:exec runs which each start fresh.
### Proof
- pnpm exec vitest run --project unit packages/providers- (unit tests, no behaviour change expected)
- pnpm -s typecheck
- pnpm test:emulator run twice against one long-lived `pnpm emulators` instance, both passing, to prove AC#1
- grep -n "ingredients: \[\]" on the test file returning nothing, to prove AC#2
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation

Added a module-level `runId = randomUUID()` (recipe-cache.emulator.test.ts) and folded it into
every fixed recipe.invalid URL in the file (fsrc-miss, fsrc-hit, fsrc-failure-memory,
fsrc-error-*, fsrc-reparse, fsrc-nested-sections, fsrc-undecodable), matching the run-unique-id
pattern already used by google-auth.emulator.test.ts. Each test's recipeKey is still derived from
its own normalise()/recipeKey() call, so no literal keys went stale.

Replaced both fixtures that stored `ingredients: []` (the "a hit" test's directly-seeded doc, and
the nested-sections test's cache.saveRecipe seed) with a one-item ParsedIngredient
(`{ line: '1 cup broth', quantity: '1', unit: 'cup', item: 'broth' }`), the shape importRecipe
actually produces; `grep -n "ingredients: \[\]" packages/providers-server/src/recipe/recipe-cache.emulator.test.ts` now returns nothing (AC#2).

## Proof

- `mise exec -- pnpm -s typecheck` -> `tsc --noEmit` clean.
- `mise exec -- pnpm exec vitest run --project unit packages/providers-` -> `Test Files 17 passed (17)`, `Tests 294 passed (294)`.
- AC#1 (the actual bug): started `pnpm emulators` once, then ran
  `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 pnpm exec vitest run --project emulator packages/providers-server/src/recipe/recipe-cache.emulator.test.ts`
  twice in a row against that one instance: first run `Tests 12 passed (12)`, second run (same
  emulator, same Firestore docs from the first run already present) also `Tests 12 passed (12)`.
  Before the fix this second run is exactly the scenario the bug describes (failure-memory test's
  first import would see the prior run's remembered failure/success; the miss test would silently
  become a hit).
- `pnpm test:emulator` (fresh `emulators:exec` instance): `packages/providers-server/src/recipe/recipe-cache.emulator.test.ts`
  passes (part of the 140 passing in that run). The run as a whole still reports
  `Test Files 1 failed | 9 passed (10)`, `Tests 4 failed | 140 passed (144)`: all 4 failures are in
  `packages/providers-firebase/src/recipe-importer.emulator.test.ts` with `FirebaseError: not-found
  [404]`, reproduced identically on a brand-new `emulators:exec` instance (not a rerun artifact).
  Confirmed unrelated to this bug: `apps/functions/src/index.ts` has no `importRecipe` export yet -
  TASK-74.4.7 ("importRecipe callable in apps/functions") is still To Do, so the callable that test
  file calls does not exist in the emulator at all. That failure is TASK-74.4.7's to fix, not this
  task's.
- Also noticed in passing (not fixed here, out of this task's scope): `packages/providers-server/src/kitchen-store.emulator.test.ts`
  has the same fixed-test-data-on-a-long-lived-emulator shape this task fixes ("finds nothing for
  someone with no kitchen yet" fails on a second run against one `pnpm emulators` instance because
  an earlier test's kitchen is still there under the same hard-coded id). Flagging for a follow-up
  task; this task's acceptance criteria name only recipe-cache.emulator.test.ts.

No repro: recordable as a failing test command: the bug only shows on a second run against a long-lived pnpm emulators instance, which a single record-check run (fresh emulators:exec) cannot reproduce, and reviewers are told not to start emulators while others run in parallel. The worker's two consecutive runs against one instance (12/12 both times) are the proof.

Closed by reviewer. AC#1: every recipe.invalid URL in recipe-cache.emulator.test.ts carries a module-level randomUUID runId (commit 822df53); worker ran the file twice against one long-lived emulator instance, 12/12 both times. AC#2: both ingredients: [] fixtures replaced with a one-item ParsedIngredient. AC#3: providers unit 294/294 and typecheck clean; orchestrator saw pnpm test:emulator 148/148 on main 7fccb40. Finding (low, not filed): kitchen-store.emulator.test.ts has the same fixed-id rerun bug the worker flagged; orchestrator may file a follow-up.
<!-- SECTION:NOTES:END -->
