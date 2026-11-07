---
id: TASK-74.7.3
title: 'Kitchen recipe merge: earlier createdAt keeps content, delete wins'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:54'
labels:
  - size-2
  - layer-core
dependencies:
  - TASK-74.3.1
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §4 and §0.6, decision-16 and R20/R46. No mergeStamped is used. Trap: `first` has no content tiebreak, so the property arbitrary must hold content constant per recipe id, with the reason written in the test. Covers TASK-74.7 AC#2.

Split key: core-recipe-merge. Layer: core. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 merge/recipe-merge.ts exports mergeRecipe and isRecipeDeleted as in contract §4, and mergeRecipe throws on different ids
- [ ] #2 Example tests: the earlier createdAt wins addedBy and createdAt; a delete on either copy wins; a later copy with deleted:null (a re-import) never clears a tombstone; different ids are refused
- [ ] #3 fast-check properties: order independence (forward vs reversed fold), any shuffle, idempotence, associativity and delete-never-undone, using an arbitrary with fixed id and content, members alex|sam and at 0..12
- [ ] #4 Exported from packages/core/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/core passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write packages/core/src/merge/recipe-merge.ts: mergeRecipe(a, b) throws on a.id !== b.id; first = earlier createdAt, tie by addedBy <= (copied from mergeMeal); content/addedBy/createdAt come from first; deleted = laterStamp(a.deleted, b.deleted). isRecipeDeleted(recipe) = recipe.deleted !== null.
2. Write recipe-merge.test.ts modelled on meal-merge.test.ts: example tests (earlier createdAt keeps addedBy/createdAt/content, delete on either copy wins, re-import with deleted:null never clears a tombstone, different ids throw) plus fast-check properties (order independence, shuffle, idempotence, associativity, delete-never-undone) on an arbitrary with fixed id and content, members alex|sam, at 0..12. Comment explaining content is held constant per id because the same recipeId comes from the same server cache entry and `first` has no content tiebreak.
3. Export mergeRecipe and isRecipeDeleted from packages/core/src/index.ts.
4. Run vitest unit for packages/core and repo-wide typecheck; record output in notes.

### Risks
first has no content tiebreak, so the property arbitrary must hold content (sourceUrl/title/yield/steps/ingredients/image) constant per id - only addedBy/createdAt/deleted vary - otherwise associativity/order-independence properties would be falsified by a case the real system never produces (same recipeId always carries the same content). Any contract ambiguity goes in this task's notes and work stops rather than guessing.

### Proof
- AC1/AC2/AC3: vitest --project unit packages/core output showing recipe-merge.test.ts passing (examples + properties).
- AC4: index.ts export plus `pnpm -s typecheck` and `vitest --project unit packages/core` output pasted into notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/core/src/merge/recipe-merge.ts (mergeRecipe, isRecipeDeleted) and recipe-merge.test.ts, exported from packages/core/src/index.ts. Commit c724d42.

AC1: mergeRecipe(a, b) throws `cannot merge different recipes: <a> and <b>` on different ids; first = earlier createdAt, tie by addedBy <= (copied from mergeMeal); content/addedBy/createdAt from first; deleted = laterStamp(a.deleted, b.deleted).

AC2/AC3 - `mise exec -- pnpm exec vitest run --project unit packages/core/src/merge/recipe-merge.test.ts`:
 Test Files  1 passed (1)
      Tests  10 passed (10)
Covers: earlier createdAt keeps addedBy/createdAt/content; tied createdAt breaks tie by addedBy; delete on either copy wins (exercises laterStamp, not just `first`); a re-imported copy with deleted:null never clears a tombstone; different ids throw. Properties: order independence (forward/reversed fold), any shuffle, idempotence, associativity, delete-never-undone. Arbitrary fixes id and content (sourceUrl/title/yield/steps/ingredients/image) and varies only addedBy/createdAt/deleted (members alex|sam, at 0..12), with a comment explaining why: the same recipeId always comes from the same server cache entry, and `first` has no content tiebreak, so letting content vary would falsify associativity/order-independence on a case the real system never produces.

AC4 - exported from packages/core/src/index.ts (`export { isRecipeDeleted, mergeRecipe } from './merge/recipe-merge.ts'`). Full suite + typecheck:
`mise exec -- pnpm exec vitest run --project unit packages/core` -> Test Files 14 passed (14), Tests 124 passed (124)
`mise exec -- pnpm -s typecheck` -> clean (tsc --noEmit, no output)

Repo-wide, at commit time via lefthook pre-commit: checks (16 checks) passed, typecheck passed, unit-tests (139 files, 1775 tests) passed.
<!-- SECTION:NOTES:END -->
