---
id: TASK-74.4.5
title: 'importRecipe: cache, failure memory, fetch and parse'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:15'
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
1. Write recipe-key with its test, and the cache interface.
2. Write importRecipe, then the unit tests with an in-test memory cache.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/recipe-key.ts
- packages/providers-server/src/recipe/recipe-key.test.ts
- packages/providers-server/src/recipe/recipe-cache.ts
- packages/providers-server/src/recipe/import-recipe.ts
- packages/providers-server/src/recipe/import-recipe.test.ts
- packages/providers-server/src/index.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Contract amendment 2026-11-07 (orchestrator): importRecipe resolves a relative image against the fetched page's final URL with new URL(image, pageUrl), keeps it only if http(s), else null - see TASK-74's plan, Amendments. Include a test for a relative image and for one that can't be resolved.

Orchestrator ruling 2026-11-07 (decision-3 mediation): (1) resolving against the normalised request URL is accepted for the first pass; carrying the final URL is a follow-up draft, not this task. (2) The empty-image guard (empty string -> null) is now in the contract (TASK-74's plan, Amendments). Remaining for this task: the reviewer's test for an image that cannot be resolved.
<!-- SECTION:NOTES:END -->
