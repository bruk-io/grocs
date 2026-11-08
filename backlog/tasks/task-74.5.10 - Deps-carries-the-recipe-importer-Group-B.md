---
id: TASK-74.5.10
title: Deps carries the recipe importer - Group B
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 02:49'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-74.5.3
  - TASK-74.7.9
  - TASK-74.5.4
  - TASK-74.5.5
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §8 (Deps.recipeImporter, instrumentDeps, testing/client.ts) and §0.7. This is the first member of integration Group B. It edits a shared worktree and does NOT commit. app-compose-recipes then supplies the importer in apps/mobile, and orch-integrate-deps commits. The application construction sites that break are: testing/client.ts, dispatcher.test.ts, instrument.test.ts, remove-meal.scenario.test.ts, and the make() helpers in the six query tests (find-my-kitchen, get-invite-preview, get-kitchen-info, get-kitchen-invite, queries, watch-week-meals). Covers TASK-74.5 AC#5 (wiring) and TASK-74.7 AC#3 (consumers compile).

Split key: application-recipe-deps. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Deps has a required readonly recipeImporter: RecipeImporter, and instrumentDeps wraps it as port 'recipeImporter'. instrument.test.ts asserts the port name and that the method is 'importRecipe'
- [x] #2 createTestClient accepts recipeImporter? (default FakeRecipeImporter) and returns it
- [x] #3 Every application Deps construction site listed in the description supplies a FakeRecipeImporter
- [x] #4 vitest --project unit packages/application passes in the shared worktree, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Widen `Deps` (dispatch/types.ts) with required `recipeImporter: RecipeImporter` and widen `instrumentDeps` to wrap it as port 'recipeImporter'.
2. Update `instrument.test.ts` to assert the port name 'recipeImporter' and method 'importRecipe'.
3. Widen `testing/client.ts`: `TestClientOptions.recipeImporter?` defaulting to `new FakeRecipeImporter()`, exposed on the returned client.
4. Fix every other application Deps-construction site: dispatcher.test.ts, remove-meal.scenario.test.ts, and the six query test `make()` helpers (find-my-kitchen, get-invite-preview, get-kitchen-info, get-kitchen-invite, queries, watch-week-meals).
5. Run `vitest --project unit packages/application` and `pnpm -s typecheck`, record output; do not commit (shared Group B worktree).

### Risks
Contract (TASK-74 §8, §0.7) is followed exactly: field name `recipeImporter` (required, no `?`), instrumented record carries `{port:'recipeImporter', method:'importRecipe'}`. No contract change needed.

### Proof
- `vitest --project unit packages/application`: 18 test files / 98 tests passed.
- `pnpm -s typecheck`: no errors under packages/application; remaining errors are in apps/mobile (compose-firebase.ts, compose-demo.ts, render-route.tsx) missing `recipeImporter` on Deps literals, which is app-compose-recipes' (TASK-74.5.11) job per the Group B split, not this task's layer/paths.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation notes (application layer, Group B member 1 of 2)

Changed files (all in packages/application, within layer boundary):
- dispatch/types.ts: `Deps.recipeImporter: RecipeImporter` (required, no `?`), import from `@grocs/ports`.
- instrumentation/instrument.ts: `instrumentDeps` now wraps `recipeImporter` as `instrumentPort('recipeImporter', deps.recipeImporter, ...)`.
- instrumentation/instrument.test.ts: 'wraps every provider a command uses' now builds Deps with `new FakeRecipeImporter()`, calls `importRecipe`, and asserts the port order includes 'recipeImporter' and the last record matches `{port:'recipeImporter', method:'importRecipe'}` (AC#1).
- testing/client.ts: `TestClientOptions.recipeImporter?: RecipeImporter` defaults to `new FakeRecipeImporter()`; `TestClient` now also exposes `recipeImporter` (AC#2).
- dispatch/dispatcher.test.ts, commands/remove-meal.scenario.test.ts, queries/find-my-kitchen.test.ts, queries/get-invite-preview.test.ts, queries/get-kitchen-info.test.ts, queries/get-kitchen-invite.test.ts, queries/queries.test.ts, queries/watch-week-meals.test.ts: every hand-built Deps/deps literal now supplies `recipeImporter: new FakeRecipeImporter()` (AC#3).

No contract change was needed; FakeRecipeImporter/RecipeImporter were already exported from @grocs/ports (TASK-74.5.3/.5.4 completed).

### Proof (AC#4)
`mise exec -- pnpm exec vitest run --project unit packages/application`:
```
 Test Files  18 passed (18)
      Tests  98 passed (98)
```

`mise exec -- pnpm -s typecheck` (repo-wide, as expected still red mid-group): no errors in packages/application. The three remaining errors are all in apps/mobile (compose-firebase.ts:34, compose-demo.ts:48, render-route.tsx:56) — each is `Property 'recipeImporter' is missing in type ... but required in type 'Deps'`, which is exactly the break surface TASK-74.5.11 (app-compose-recipes, next in Group B) is scoped to fix. No commit made; shared worktree left for the next Group B member.

Verified Group B precondition (contract §0.7) before finishing: watch-kitchen-recipes.ts exists, watchKitchenRecipes is exported from packages/application/src/index.ts, and SyncStore port.ts has getRecipes/mergeRecipe — Group A is present in this worktree.

Reviewed by philosophy:reviewer on main at dbcc97b. Closed: all four criteria met. AC1: Deps.recipeImporter is a required readonly field (dispatch/types.ts); instrumentDeps wraps it as 'recipeImporter'; instrument.test.ts checks the port order and {port:'recipeImporter', method:'importRecipe'}. AC2: createTestClient defaults to FakeRecipeImporter and returns it. AC3: all 8 listed construction sites supply FakeRecipeImporter (checked with grep). AC4: vitest --project unit packages/application re-run by the reviewer: 98/98 passed. The builder made no commit; the orchestrator committed Group B as 26782b0 under TASK-74.5.12, a deviation recorded on TASK-74.5. Orchestrator evidence: typecheck clean, pnpm check passed, 2073 tests passed. Findings: none. No drafts filed.
<!-- SECTION:NOTES:END -->
