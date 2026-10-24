---
id: TASK-1.21.3
title: 'Application: meal commands and the watchWeekMeals query'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:50'
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
- [x] #1 AddMeal, EditMeal (rename+relink together, matching AddMealScreen's single name+link form), RemoveMeal and MoveMeal commands in packages/application/src/commands/
- [x] #2 A watchWeekMeals query in packages/application/src/queries/, mirroring watch-week-items.ts
- [x] #3 Every command requires a signed-in member (same not-signed-in error shape as AddItem) and is registered in commandHandlers; exported from packages/application/src/index.ts
- [x] #4 Unit tests for every command and the query, including the empty-name and not-signed-in error paths
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(52 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  125 passed (125)
      Tests  1639 passed (1639)
   Start at  18:36:14
   Duration  8.44s (transform 37.81s, setup 3.47s, import 108.66s, tests 36.83s, environment 19.39s)

$ firebase emulators:exec --only firestore,auth,functions --project demo-grocs 'vitest run --project emulator'
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-grocs", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
⚠  auth: Port 9099 is not open on 127.0.0.1, could not start Authentication Emulator.
⚠  auth: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "auth": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  firestore: Port 8080 is not open on 127.0.0.1, could not start Firestore Emulator.
⚠  firestore: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "firestore": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  logging: Logging Emulator unable to start on port 4500, starting on 4501 instead.
i  emulators: Shutting down emulators.

Error: Could not start Authentication Emulator, port taken.
[ELIFECYCLE] Command failed with exit code 1.
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed. All four criteria met and ticked.

AC1: add-meal.ts, edit-meal.ts (rename+relink in one command, single stamp, single mergeMeal), remove-meal.ts and move-meal.ts all in packages/application/src/commands/. AC2: queries/watch-week-meals.ts mirrors watch-week.ts exactly in shape (deps-first signature, onError passthrough, filter+sort inside the watch callback); verified the notes' claim that core has no meal counterpart to WeekList/visibleItems (grep: packages/core/src/model/list.ts is item-only), so the deleted-filter and createdAt/id order legitimately live in this layer. AC3: all four start with auth.currentUser() and the identical err({code:'not-signed-in'}) shape as add-item.ts, all four registered in commandHandlers and exported with their event types from index.ts. AC4: add/edit/remove/move each have a .scenario.test.ts (happy path, not-signed-in, plus empty-name/invalid-link/invalid-day/meal-not-found as applicable, R19 concurrent-add, R20 removal-never-deletes-items and stays-removed, R36 no-personal-data-in-logs) and watch-week-meals.test.ts covers the query; tests drive the real dispatcher against the real InMemorySyncStore, not mocks.

Verified independently: commit c4db885's application-layer files match this task's modified_files exactly, with nothing from this task written outside packages/application (relevant because the write guard is currently unregistered). Checked that moving a meal across weeks is safe end to end: FirestoreSyncStore.mergeMeal keys by kitchens/{id}/meals/{mealId} with weekId as a queried field, so a cross-week move rewrites one document rather than orphaning a copy in the old week.

Check record: record-check --tier full is recorded as exit 1, and the failure is not this task's. pnpm check 14/14 green, typecheck 0 errors, unit suite 125 files / 1639 tests pass; the run then failed at 'firebase emulators:exec --only firestore,auth,functions' with 'Could not start Authentication Emulator, port taken'. Confirmed by lsof that ports 8080 and 9099 were held by a concurrent agent's already-running emulators, so it was contention, not a defect. Ran the suite against those live emulators instead: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 GCLOUD_PROJECT=demo-grocs pnpm exec vitest run --project emulator - 8 files / 91 tests pass. The ports were still held on re-check, so the recorded exit 1 stands; read it with this note. The check fixed or reformatted nothing as it ran.

Findings, none of which block the close and none filed as drafts:
- Low, for whoever owns the finish line: AC2 names 'watch-week-items.ts', which does not exist. The real mirror is queries/watch-week.ts, exporting watchWeekItems. Ticked on substance, not reworded.
- Low, cosmetic: watch-week-meals.ts:25's comparator returns 1 rather than 0 for equal ids. Unreachable with unique ids, so not worth a change on its own; worth folding in if that file is touched again.
- Note, intentional and documented: AddMeal.link is optional (string | null | undefined) while EditMeal.link is required (string | null). The asymmetry matches the two call shapes (create omits, the form always submits both) and the notes explain it; recorded here so a later reader does not read it as an oversight.

Open for the orchestrator: TASK-1.21.3's dependency TASK-1.21.2 was still In Progress at close time. The ports work it depends on is committed in the same c4db885, so this close is not blocked on it, but TASK-1.21.2's own close is still outstanding and TASK-1.21 cannot close until it and the remaining children do.
<!-- SECTION:NOTES:END -->
