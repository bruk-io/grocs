---
id: TASK-74.7.9
title: watchKitchenRecipes query delivers a kitchen's live recipes
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:50'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-74.7.8
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §8 (the query). It takes the SyncStore directly, so it does not widen Deps and commits on its own once Group A has landed. The app uses it in Group B. Covers TASK-74.5 AC#4 (a read path that never calls the importer) and TASK-74.7 AC#3 (consumers).

Split key: application-recipe-query. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 queries/watch-kitchen-recipes.ts exports watchKitchenRecipes(store, kitchenId, onRecipes, onError?) as in contract §8
- [x] #2 watch-kitchen-recipes.test.ts: it delivers live recipes only, hides tombstones, passes errors to onError, and its unsubscribe stops calls
- [x] #3 Exported from src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/application passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. queries/watch-kitchen-recipes.ts: watchKitchenRecipes(store: SyncStore, kitchenId, onRecipes, onError?) per contract §8, taking the SyncStore directly (not Deps, per the split note). Calls store.watchRecipes(kitchenId, recipes => onRecipes(recipes.filter(r => !isRecipeDeleted(r))), onError).
2. watch-kitchen-recipes.test.ts against InMemorySyncStore: live recipes delivered, tombstones hidden, a thin fake SyncStore that calls onError to prove errors pass through, and that calling the returned Unsubscribe stops further onRecipes calls.
3. Export watchKitchenRecipes from src/index.ts.

### Risks
Group A (TASK-74.7.4/5/6/7, bundled by 74.7.8) is still In Progress in the dependency graph, but the SyncStore port/fake/contract widening (watchRecipes, mergeRecipe, getRecipes, isRecipeDeleted) is already present on main after merging - this task only needs that surface, which contract §8 says commits independently of Deps/Group B. No contract change needed.

### Proof
- vitest --project unit packages/application (new test file green, full project green)
- pnpm -s typecheck (repo-wide)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: packages/application/src/queries/watch-kitchen-recipes.ts exports watchKitchenRecipes(store, kitchenId, onRecipes, onError?) per contract §8 (AC#1), taking the SyncStore directly so it commits independently of Group A/B. It filters tombstones (isRecipeDeleted) before calling onRecipes.

Note on ordering: contract §8 specifies filtering only ("live recipes only"), no ordering clause, unlike watchWeekMeals whose contract asked for insertion order. So this query does not sort; that is a deliberate reading of the contract, not an oversight.

AC#2 (watch-kitchen-recipes.test.ts): 4 tests - delivers live recipes with tombstones hidden, delivers an empty list soon after subscribing with none yet, passes errors through to onError (via a hand-built SyncStore stub since InMemorySyncStore.watchRecipes never raises), and the returned unsubscribe stops further onRecipes calls.

AC#3 (export + checks):
- Exported from packages/application/src/index.ts.
- `mise exec -- pnpm exec vitest run --project unit packages/application`: Test Files 18 passed (18) / Tests 98 passed (98).
- `mise exec -- pnpm -s typecheck`: clean (tsc --noEmit, no output).

Dependency graph note: TASK-74.7.4/5/6/7/8 (Group A) still show In Progress in the board, but the SyncStore surface this task needs (mergeRecipe, getRecipes, watchRecipes, isRecipeDeleted) is already on main as of the `git merge main` done at start of this task (merge commit brought ca542a3 in). Confirmed empirically by reading packages/ports/src/sync-store/{port,fake}.ts in this worktree. No contract change needed; not treating this as a blocker per contract §8's "commits on its own once Group A has landed."

Review (philosophy:reviewer): closed. AC#1 signature matches contract §8 exactly (store, kitchenId, onRecipes, onError?) -> Unsubscribe, filters isRecipeDeleted. AC#2 4 tests cover live delivery, tombstone hiding, onError passthrough, unsubscribe; rerun green (4/4). AC#3 exported at src/index.ts:39; orchestrator's merged-main run at 5bbf8bc: typecheck clean, pnpm test 2065 passed, pnpm check 16 passed. Findings: none blocking. Info only: no ordering of recipes, a deliberate reading of §8 (no ordering clause); nothing filed.
<!-- SECTION:NOTES:END -->
