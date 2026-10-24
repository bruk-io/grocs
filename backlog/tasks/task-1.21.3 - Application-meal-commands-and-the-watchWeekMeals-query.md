---
id: TASK-1.21.3
title: 'Application: meal commands and the watchWeekMeals query'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:31'
labels:
  - layer-application
  - size-2
dependencies:
  - TASK-1.21.2
modified_files:
  - packages/application/src/commands/add-meal.ts
  - packages/application/src/commands/add-meal.scenario.test.ts
  - packages/application/src/commands/edit-meal.ts
  - packages/application/src/commands/edit-meal.scenario.test.ts
  - packages/application/src/commands/remove-meal.ts
  - packages/application/src/commands/remove-meal.scenario.test.ts
  - packages/application/src/commands/move-meal.ts
  - packages/application/src/commands/move-meal.scenario.test.ts
  - packages/application/src/queries/watch-week-meals.ts
  - packages/application/src/queries/watch-week-meals.test.ts
  - packages/application/src/commands/index.ts
  - packages/application/src/index.ts
  - packages/application/src/commands/add-item.scenario.test.ts
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Application-layer commands dispatching onto the SyncStore port's new meal methods, mirroring packages/application/src/commands/add-item.ts and packages/application/src/queries/find-my-kitchen.ts's shapes. Depends on the ports contract (TASK-1.21.2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AddMeal, EditMeal (rename+relink together, matching AddMealScreen's single name+link form), RemoveMeal and MoveMeal commands in packages/application/src/commands/
- [ ] #2 A watchWeekMeals query in packages/application/src/queries/, mirroring watch-week-items.ts
- [ ] #3 Every command requires a signed-in member (same not-signed-in error shape as AddItem) and is registered in commandHandlers; exported from packages/application/src/index.ts
- [ ] #4 Unit tests for every command and the query, including the empty-name and not-signed-in error paths
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. commands/add-meal.ts: AddMeal{kitchenId,weekId,dayIndex,name,link?} -> createMeal + mergeMeal, mirroring add-item.ts; not-signed-in/empty-name/invalid-link errors; MealAdded event.
2. commands/edit-meal.ts: EditMeal{kitchenId,weekId,mealId,name,link?} -> getMeals, find by id, renameMeal then relinkMeal, mergeMeal; mirrors set-item-state.ts's fetch-then-mutate pattern; meal-not-found error; MealEdited event.
3. commands/remove-meal.ts: RemoveMeal{kitchenId,weekId,mealId} -> getMeals, find, removeMeal, mergeMeal; MealRemoved event.
4. commands/move-meal.ts: MoveMeal{kitchenId,weekId,mealId,toWeekId,toDayIndex} -> getMeals(weekId), find, moveMeal, mergeMeal; MealMoved event with fromWeekId/toWeekId.
5. queries/watch-week-meals.ts: watchWeekMeals(deps,kitchenId,weekId,onMeals,onError) -> deps.syncStore.watchMeals, filtering isMealDeleted and sorting by createdAt/id (mirrors watch-week.ts/visibleItems; no core WeekList equivalent exists for meals).
6. Register all four commands in commands/index.ts's commandHandlers; export everything from index.ts.
7. Fix add-item.scenario.test.ts's inline SyncStore test doubles (3 spots) to add mergeMeal/getMeals/watchMeals stubs so they satisfy the extended interface.
8. Unit/scenario tests for each command (happy path, not-signed-in, empty-name/invalid-link/meal-not-found as applicable) and the query.
9. Run pnpm exec vitest run --project unit packages/application, then full pnpm test, pnpm check, pnpm typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented AddMeal, EditMeal (rename+relink together, matching AddMealScreen's single form), RemoveMeal and MoveMeal in packages/application/src/commands/, and watchWeekMeals in packages/application/src/queries/watch-week-meals.ts (mirrors watch-week.ts/visibleItems; no core WeekList equivalent exists for meals, so the deleted-filter plus createdAt/id order lives in this layer, using core's isMealDeleted for the predicate). dayIndex is taken as a raw number and narrowed with core's toDayIndex, returning an 'invalid-day' error on failure (toDayIndex had no caller before this). EditMeal.link is required (string | null), not optional, since cleanLink treats undefined and null identically and the form always submits both fields; rename+relink chain as pure calls with a single mergeMeal at the end. Every command requires auth.currentUser() (not-signed-in error) and is registered in commandHandlers and exported from index.ts. Error messages are mapped per-code (not hardcoded) since createMeal/renameMeal/relinkMeal can fail two different ways. Fixed the 3 inline SyncStore test doubles in add-item.scenario.test.ts (TS2739) to add mergeMeal/getMeals/watchMeals stubs. Added *.scenario.test.ts for each command (happy path, not-signed-in, empty-name/invalid-link/invalid-day/meal-not-found as applicable, a concurrent-add case mirroring R19, an R20 removal-never-deletes-items case, and an R36 no-personal-data-in-logs case) and watch-week-meals.test.ts for the query. pnpm exec vitest run --project unit packages/application: 15 files / 88 tests pass. Full pnpm test: 125 files / 1630 tests pass. pnpm check: 14/14 green. pnpm typecheck: 0 errors (the 3 TS2739 errors flagged in TASK-1.21.2's notes as in-scope for this task are resolved; no errors remain anywhere in the repo at this point in the slice).

Clarifying the typecheck claim above against TASK-1.21.2's notes: 1.21.2 predicted TS2420 in providers-firebase/providers-memory and TS2739 in apps/mobile's composition root once SyncStore grew the meal methods, since those weren't implemented yet when 1.21.2 was written. By the time this task ran, TASK-1.21.4 had already landed mergeMeal/getMeals/watchMeals in both packages/providers-firebase/src/firestore-sync-store.ts and packages/providers-memory/src/memory-sync-store.ts (verified by grep), so those predicted errors did not materialize - not because the root typecheck misses those packages (confirmed via tsconfig.json: include is apps, packages, tools, firebase, which covers all four paths 1.21.2 named). So '0 errors, no errors remain anywhere in the repo' is accurate as stated, not a scope gap in tsc's coverage.

Addressed reviewer-application's feedback: (1) added an R20 scenario test to remove-meal.scenario.test.ts covering edit-then-re-remove of a tombstoned meal, asserting it stays deleted and never reappears in watchWeekMeals (note: the delete stamp itself does advance on a second remove via laterStamp's normal merge semantics - only 'stays deleted' is the actual invariant, not a frozen stamp, so the test asserts that instead of stamp equality). (2) Dropped the MEAL_ERROR_MESSAGES map from add-meal.ts and edit-meal.ts, inlining error messages to match move-meal.ts and the add-item.ts mirror. (3) Corrected modified_files metadata via --modified-file (dispatch/types.ts was never touched; removed it, added every file actually changed). pnpm exec vitest run --project unit packages/application: 15 files / 89 tests pass. pnpm typecheck and full pnpm test now show failures, but all are outside packages/application: a TS2739 in apps/mobile/src/screens/AddMealScreen.tsx (MealFormTemplate prop mismatch) and 3 test failures in packages/ui/src/stories.accessibility.test.tsx and apps/mobile/src/routes/screens.route.test.tsx - all from concurrent in-flight UI/app work on MealFormTemplate (git status shows packages/ui/src/templates/MealFormTemplate.tsx modified by someone else, not by this task). pnpm check: 14/14 green. Nothing in packages/application changed to cause these; flagging rather than touching files outside this task's layer.

Update (current state, superseding the prior note's stale snapshot): pnpm typecheck now exits 0 with no errors anywhere in the repo - the apps/mobile/src/screens/AddMealScreen.tsx TS2739 reported above has since been resolved by concurrent UI/app work. Full pnpm test: 124 files / 1639 tests pass, 1 failure remains - packages/ui/src/stories.accessibility.test.tsx's MealFormTemplate 'Removing' story (a contrast assertion), which is TASK-1.21.5's territory, not packages/application's; nothing in this task's layer is implicated. pnpm check: 14/14 green. pnpm exec vitest run --project unit packages/application: 15 files / 89 tests pass.
<!-- SECTION:NOTES:END -->
