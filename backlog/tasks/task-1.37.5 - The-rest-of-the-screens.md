---
id: TASK-1.37.5
title: The rest of the screens
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 09:15'
labels:
  - size-5
  - layer-app
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.3
  - TASK-1.37.4
modified_files:
  - apps/mobile/app
  - apps/mobile/src
  - design/reference
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every other reference screen as a route that renders its template with sample data from the app, without logic: Household, JoinInvite and its invalid-code state, Plan, AddMeal, Groceries (Main), QuickAdd, Settings, and the offline and toast states. RecipeImport stays parked; the D1 and D2 options stay as reference. Cites R40, R42, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each of those screens is a route rendering its template with sample data, matching its reference screenshot
- [ ] #2 Every screen shows its mushroom host (R40), and moving between screens works as in the design (tabs, back, add) without logic behind the buttons
- [ ] #3 The walking skeleton's add-item flow and every existing test still pass
- [ ] #4 Android and iOS bundles build, and pnpm check:release passes
- [ ] #5 Each built screen's board and shot are deleted, leaving RecipeImport and the D1 and D2 options (R66)
- [ ] #6 Each route has a render test with its sample data, and its links lead to the routes the design shows (decision-11 level 4)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Sample data: apps/mobile/src/sample/sample-data.ts (the app's own copy; ui fixtures are stories-only).
2. Screens in apps/mobile/src/screens (HouseholdScreen, JoinInviteScreen, JoinInviteInvalidScreen, PlanScreen, AddMealScreen, GroceriesScreen, QuickAddScreen, SettingsScreen), each rendering its ui template with sample data and local field state only. Navigation via expo-router (navigate) to the routes the design links: Welcome 'Open it to join' -> /join; Join with Google -> /plan; Household Start planning -> /plan; Plan tabs -> /groceries, settings -> /settings, plan a meal -> /add-meal; AddMeal back/submit -> /plan; Groceries tabs -> /plan, settings, add -> /quick-add; QuickAdd and Settings back -> /groceries; invalid 'Back to my invite' -> /join. Groceries takes ?state=groceries|offline|toast|empty|allDone.
3. Thin routes in apps/mobile/app. Existing / route is unchanged for signed-in (live ListScreen keeps the skeleton and its tests); WelcomeScreen gets onOpenInvite.
4. Route tests per route (render with sample data, links lead to the right routes), plus the reduce-motion route test from the TASK-1.37.4 review.
5. Delete the 9 boards, shots and canvas.json entries (R66).
### Risks
- Route tests use the shimmed expo-router harness; navigation assertions need a layout that renders the target route. - reference-built check by name. - Keeping / as the live list means Groceries template is not fed from the skeleton (UI only per task; wiring is a later slice).
### Proof
vitest --project app --project tools apps; pnpm check; pnpm typecheck; pnpm test; pnpm check:release; pnpm --filter @grocs/ui visual (unchanged).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: added decision-11's route tests, after Bruk asked for the right level of testing in the UI build.

Checks changed: .claude/checks.json's full tier gained the browser pass (pnpm --filter @grocs/ui visual -- --no-build) in TASK-1.37.6 (commit 5a3cecc), merged into main after this task was accepted. Noted up front by the orchestrator so the close isn't refused for a change this task didn't make.

From the TASK-1.37.4 review (optional, size-1): a route test that sets the phone's reduce motion and checks the kitchen holds still through _layout's MotionProvider wiring, which is covered only by reading the code today.

## Report (builder-app)
Routes (apps/mobile/app, thin) render screens in apps/mobile/src/screens, each a ui template with sample data from apps/mobile/src/sample/sample-data.ts (the app's own copy; ui's fixtures are stories-only) and local field state only: /household (KitchenSetupTemplate), /join (InviteJoinTemplate), /join-invalid (InviteRetryTemplate), /plan (MealPlanTemplate), /add-meal (MealFormTemplate), /groceries (GroceryListTemplate), /quick-add (ItemPickerTemplate), /settings (PreferencesTemplate). Offline, Toast, Empty and AllDone are /groceries?state=offline|toast|empty|allDone (default is the Main list with the partner toast). Every template draws its mushroom host (R40).
Navigation (screens/navigate.ts, router.navigate, as the boards' links): Welcome Open it to join -> /join; Join with Google, Start planning, Add to Thursday and meal-form Back -> /plan; Plan Groceries tab -> /groceries, settings -> /settings, Plan a meal -> /add-meal; Groceries Meal plan tab -> /plan, settings -> /settings, add (header add and empty-state button) -> /quick-add; QuickAdd and Settings back -> /groceries; Sign out -> / (Welcome); invalid-code Back to my invite -> /join. Nothing else has logic. Meal rows do not open (RecipeImport is parked).
Skeleton vs Groceries: the signed-in home route / still renders the live ListScreen unchanged, so add-item, the test sign-in and every existing test stand; /groceries is a separate route showing the template with sample data. Reason: this task is UI only and the template takes row data the skeleton's Item model does not yet supply (sections, meal badges, who added). Feeding the template from the live data, and making / lead to it, belongs to the slice that wires the list. Consequence: the Groceries screen is not yet reachable from the signed-in home; it is reached by route.
Tests (decision-11 level 4): apps/mobile/src/routes/screens.route.test.tsx, 17 tests, one per route plus each link and the groceries states; the existing index route tests pass unchanged. Not done: the optional reduce-motion route test from the TASK-1.37.4 review.
Reference (R66): deleted Household, JoinInvite, JoinInviteInvalid, Plan, AddMeal, Main, QuickAdd, Settings, Offline, Toast boards and shots and their canvas.json boards/order entries; RecipeImport, DS-Tokens and D1/D2 remain. Main, Offline and Toast have no screen file of their own (they are /groceries states), so reference-built does not see them as built; deleted by this task regardless.
Not verified on a device or simulator; bundles build via check:release. Differences from the reference are those in TASK-1.37.3's notes (ui unchanged).
Check pnpm exec vitest run --project app --project tools apps (27 passed), pnpm check, pnpm typecheck, pnpm test (1156 passed), pnpm check:release, pnpm --filter @grocs/ui visual (304 views, unchanged) all exit 0.
<!-- SECTION:NOTES:END -->
