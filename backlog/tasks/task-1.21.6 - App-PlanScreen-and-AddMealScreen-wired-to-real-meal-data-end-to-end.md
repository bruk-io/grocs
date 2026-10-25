---
id: TASK-1.21.6
title: 'App: PlanScreen and AddMealScreen wired to real meal data, end to end'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-25 00:41'
labels:
  - layer-app
  - size-3
  - finish-moved
dependencies:
  - TASK-1.21.3
  - TASK-1.21.4
  - TASK-1.21.5
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Final integration step of the meal-plan slice: wires the real application commands and watchWeekMeals query onto the screens, replacing the sample-data.ts scaffolding PlanScreen.tsx and AddMealScreen.tsx have used until now. Depends on application (TASK-1.21.3), providers (TASK-1.21.4) and ui (TASK-1.21.5) all landing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 apps/mobile's App facade (compose-app.ts) gains watchWeekMeals
- [x] #2 PlanScreen.tsx shows the real week's meals via watchWeekMeals instead of the sample week export; a new kitchen's plan starts blank
- [x] #3 AddMealScreen.tsx dispatches AddMeal for a new meal and EditMeal (plus the new Remove action dispatching RemoveMeal) when opened for an existing one, via a route param
- [x] #4 GroceriesScreen's meal badges/filter rail and QuickAddScreen's 'For a meal' chips both read the same real watchWeekMeals data instead of the sample week export, so the app never shows two different meal lists
- [x] #5 A route test proves add/rename/relink/remove each dispatch the right command, mirroring GroceriesScreen's existing watchWeekItems test pattern; moving a meal between weeks has no UI affordance anywhere yet (confirmed by grepping packages/ui/src - WeekList/DayRow and MealFormTemplate have no day/week picker or drag target), so it's out of this task's route-test scope and filed separately as TASK-51 - the MoveMeal command itself is already built and tested at the application layer (TASK-1.21.3), only the UI entry point is missing
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/week-days.ts (new): pure helpers shared by Plan/AddMeal/Groceries/QuickAdd - weekDays(at): Monday-based {weekId, days: [{dayId, weekday, day, dayIndex}]} for the week containing `at` (consolidates the Monday math duplicated in GroceriesScreen's weekLabelFor); dayFor(dayId): {weekId, dayIndex} for a dayId outside that week object; dayLabelFor(at, dayIndex): "Thursday, Oct 22" for AddMealScreen's dateLabel; mealTone(mealId): deterministic MealTone keyed by id (not list position), so removing one meal never recolours another.
2. apps/mobile/src/screens/use-kitchen.ts (new): extracts the watchSession+findMyKitchen resolution (currently inline in app/index.tsx) into one hook, reused by plan.tsx, add-meal.tsx and quick-add.tsx so each route resolves its own app+kitchenId without copying that dance three times. index.tsx switches to it with no behaviour change.
3. compose-app.ts: App facade gains watchWeekMeals(kitchenId, weekId, onMeals, onError), mirroring watchWeekItems (AC1).
4. PlanScreen.tsx: takes {app, kitchenId}; subscribes watchWeekMeals for the current week (app.now()), builds PlanDay[] via week-days.ts, tone via mealTone(meal.id); onOpenMeal/onPlan call go.addMeal(dayId, mealId?); household/member avatars and week nav stay sample/absent (explicitly out of scope per TASK-1.21's notes) (AC2).
5. AddMealScreen.tsx: takes {app, kitchenId, dayId, mealId?} (route params); subscribes watchWeekMeals for dayFor(dayId).weekId, finds mealId in the result to prefill name/link when editing; dispatches AddMeal (no mealId) or EditMeal (mealId present), plus Remove wired to RemoveMeal (AC3).
6. GroceriesScreen.tsx and QuickAddScreen.tsx: both switch from sample/sample-data.ts week and meals exports to the same watchWeekMeals subscription (current week), using mealTone(meal.id) for colour so Plan/Groceries/QuickAdd never disagree (AC4). QuickAddScreen gains {app, kitchenId} props from its route, same pattern as GroceriesScreen.
7. navigate.ts: go.addMeal gains optional (dayId?, mealId?) building the query string; GroceriesScreen's onPlanMeal wraps it (`() => go.addMeal()`) so the rail's own argument is never forwarded as dayId.
8. app/plan.tsx, app/add-meal.tsx, app/quick-add.tsx: each calls useKitchen() for app/kitchenId and (add-meal only) useLocalSearchParams() for dayId/mealId, passing them down as props; routes themselves stay prop-less, matching the existing route-file pattern.
9. demo/compose-demo.ts: seed() also creates real Meal records (createMeal + mergeMeal) for the sample week's content, keeping the sample ids (m1..m5) and weekIdFor(clock.now()) so the existing badge-matching and the demo/groceries-rail route tests (which assert on "Chana masala", "Sheet-pan chicken" etc.) keep passing once Plan/Groceries/QuickAdd read real data instead of sample-data.ts's week.
10. New route test (apps/mobile/src/routes/, mirroring the watchWeekItems pattern) proving add/rename/relink/remove each dispatch the right command with the right args (AC5). Move's coverage is pending a decision from the orchestrator: no UI affordance exists anywhere in packages/ui to trigger a day/week change, so there is no real user path to dispatch MoveMeal yet.
11. pnpm check, pnpm typecheck, pnpm test (all four vitest projects), pnpm test:emulator - all green before reporting done.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 24, 2026 (orchestrator, mid-build): real gap in my own original plan, caught by builder-app while wiring this task - AC5 originally asked for a route test covering move too, but no UI affordance for moving a meal exists anywhere (not a backend gap; MoveMeal is fully built and tested). Descoped to TASK-51, finish-moved.

Implemented all five ACs except move (split to TASK-51 by the orchestrator, per AC5's revised text).

New: apps/mobile/src/screens/week-days.ts (Monday-based day/week math, dayId<->weekId+dayIndex conversion, dayLabelFor, weekLabelFor, mealTone(id) keyed by meal id so removing one meal never recolours another). apps/mobile/src/screens/use-kitchen.ts (the watchSession+findMyKitchen resolution extracted from app/index.tsx, reused by plan.tsx, add-meal.tsx and quick-add.tsx so routes stay prop-less per the existing route-file pattern; index.tsx switched to it with no behaviour change).

compose-app.ts: App gains watchWeekMeals (AC1). PlanScreen.tsx: {app, kitchenId} props, real watchWeekMeals + watchWeekItems (for the toBuy badge), blank for a new kitchen (AC2); household avatars stay sample (out of scope per TASK-1.21's own notes). AddMealScreen.tsx: {app, kitchenId, dayId, mealId?} props; dispatches AddMeal (no mealId) or EditMeal+Remove->RemoveMeal (mealId present, via the route's dayId/mealId params) (AC3). Prefill-from-watch is guarded by a one-shot `prefilled` flag so a later watchWeekMeals notification (including the screen's own save) never clobbers in-progress typing - found via a failing route test, not speculative. GroceriesScreen.tsx and QuickAddScreen.tsx: both switched from sample-data.ts's week/meals exports to the same watchWeekMeals subscription, tone via the shared mealTone(id) helper, so Plan/Groceries/QuickAdd never show different meal lists or colours (AC4). navigate.ts: go.addMeal(dayId, mealId?) builds the route query; GroceriesScreen's rail "Plan a meal" wraps it with todayId(app.now()) rather than forwarding the rail's own callback argument.

New route test apps/mobile/src/routes/meal-plan.route.test.tsx (AC5): add, rename+relink and remove each proven by dispatching through the real UI and reading the fake SyncStore directly afterward, mirroring ListScreen.test.tsx's watchWeekItems pattern. One fixture bug it caught: a meal created and edited at the exact same FakeClock instant hits mergeMeal's documented same-stamp tie-break (highest JSON string wins per field) - fixed by advancing the clock between fixture setup and the edit, same convention as demo.route.test.tsx's "the sample was added a minute ago" comment.

Updated apps/mobile/src/routes/screens.route.test.tsx: /plan and /add-meal now need a real signed-in kitchen (useKitchen), so tests reaching them gained signedIn:true and, for add-meal, a ?dayId= param; the Plan test's "Chana masala" assertion became "a new kitchen's plan starts blank" (7x "Plan a meal") per AC2; two tests needed an explicit wait for the route to resolve its kitchen before pressing a button that didn't exist yet. apps/mobile/src/demo/compose-demo.ts: seed() also creates real Meal records (createMeal+mergeMeal) for the sample week's content, keeping the sample ids/dayIndex, so demo.route.test.tsx and groceries-rail.route.test.tsx (which assert on "Chana masala" etc.) still pass once Plan/Groceries/QuickAdd read real data.

pnpm check: passed (14 checks). pnpm typecheck: passed. pnpm test (unit+ui+app+tools, 126 files/1643 tests): passed. pnpm test:emulator: could not run - ports 9099/8080 already held by another process in this session (confirmed via lsof, same environmental port-contention noted in TASK-1.21.5's review). This task touches no provider/rules code, so the emulator contract suites are unaffected by it; worth a clean re-run once ports are free, but nothing in this change should be able to break them.

Modified files: apps/mobile/src/composition/compose-app.ts, apps/mobile/src/demo/compose-demo.ts, apps/mobile/src/screens/PlanScreen.tsx, apps/mobile/src/screens/AddMealScreen.tsx, apps/mobile/src/screens/GroceriesScreen.tsx, apps/mobile/src/screens/QuickAddScreen.tsx, apps/mobile/src/screens/navigate.ts, apps/mobile/src/routes/screens.route.test.tsx, apps/mobile/app/plan.tsx, apps/mobile/app/add-meal.tsx, apps/mobile/app/quick-add.tsx, apps/mobile/app/index.tsx. New files: apps/mobile/src/screens/week-days.ts, apps/mobile/src/screens/use-kitchen.ts, apps/mobile/src/routes/meal-plan.route.test.tsx.

Addressed reviewer-app's findings:

Blocker 1 (routes rendered permanently blank outside the found-kitchen state): new apps/mobile/src/screens/KitchenGate.tsx owns the same four-way render app/index.tsx had (undefined-user/null-user/looking/failed/none/found), built on use-kitchen.ts. All four routes (index.tsx, plan.tsx, add-meal.tsx, quick-add.tsx) now go through it, so none of them can silently go blank for a signed-out or kitchen-less member again. Added two screens.route.test.tsx cases against /plan: signedIn:false (shows Welcome) and {signedIn:true, kitchen:false} (shows kitchen setup) - the states the regression broke and nothing previously covered.

Blocker 2 (AddMealScreen swallowed dispatch failures): submit/remove now map every error code to a message (problemFor helper: empty-name, meal-not-found, invalid-day, not-signed-in, plus a fallback), mirroring GroceriesScreen's problem-banner pattern; the client-side empty-name guard is gone so the command's own validation is what's authoritative, matching R6's existing mirror in ListScreen. All four watchWeekMeals subscriptions (Plan, AddMeal, Groceries, QuickAdd) now pass onError. MealFormTemplate, MealPlanTemplate and ItemPickerTemplate have no banner prop - noted as a UI-layer gap; AddMealScreen/PlanScreen/QuickAddScreen each wrap their template in a View and append a Text underneath for the error, the same pattern KitchenSetupScreen already uses for its own missing banner slot.

Unvalidated dayId: week-days.ts's dayFor now returns null for a dayId that fails to parse (Date.parse NaN) or whose computed weekday fails toDayIndex's narrowing, instead of propagating NaN. app/add-meal.tsx rejects early (renders null) when dayId is missing or dayFor(dayId) is null, alongside the existing !dayId check. AddMealScreen keeps a defensive null-check after its own hooks (not before, to avoid a conditional hook-call hazard) as a backstop.

dayIndex cast: dayFor now narrows through toDayIndex instead of an unchecked `as DayIndex`; weekDays' own cast (fed by a fixed 0-6 loop, already safe) also switched to toDayIndex for consistency.

Vacuous test assertion: meal-plan.route.test.tsx's remove test now asserts toHaveLength(1) before checking .deleted, so it can't pass on an empty array.

Demo seed's dropped link: compose-demo.ts now gives seeded meals a real https://example.com link wherever the sample gave one (the sample's own 'example.com' has no protocol and fails createMeal's R6 validation), so the demo still shows the recipe-link affordance.

MEAL_TONES barrel duplication: left as a tiny follow-up per the reviewer's own fallback (app layer can't touch packages/ui/src/index.ts) - a one-line re-export of the already-existing MEAL_TONES const from packages/ui/src/atoms/meal-tone.ts would remove apps/mobile/src/screens/week-days.ts's local copy.

Re-verified: pnpm check (14 checks), pnpm typecheck, pnpm test (126 files, 1645 tests, up from 1643) all pass. Did not touch .claude/settings.json, tools/hooks/launch-guard.*, or task-1.25.md - those are unrelated in-flight changes already present in the worktree before this task started (confirmed against the session's initial git status).

New files added in this round: apps/mobile/src/screens/KitchenGate.tsx.
<!-- SECTION:NOTES:END -->
