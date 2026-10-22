---
id: TASK-1.31.2
title: >-
  App: Groceries uses the rail from 600 dp and keeps its meal filter across
  postures
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-21 15:38'
updated_date: '2026-10-22 03:29'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-1.31.1
modified_files:
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/sample/sample-data.ts
  - apps/mobile/src/demo/compose-demo.ts
  - apps/mobile/src/demo/demo.route.test.tsx
  - apps/mobile/src/routes/groceries-rail.route.test.tsx
  - apps/mobile/testing/route-setup.ts
parent_task_id: TASK-1.31
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R43. Builds the app half of decision-14: the width switch (600 dp and wider), the meal filter state, and the meals the rail shows (the sample week until the meal plan slice, TASK-1.21).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 At a window 600 dp or wider Groceries renders the inner layout with the rail, and below it the phone layout, proved by route tests at both widths
- [ ] #2 A chosen meal filter survives a change of width (fold and unfold) in a route test
- [ ] #3 In the demo, the sample items carry the sample meals' badges, and choosing a meal in the rail filters the list (demo route test)
- [ ] #4 On the Fold, unfolding and folding with a meal chosen keeps the filter, with screenshots in the notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Plan
1. GroceriesScreen: useWindowDimensions; width >= 600 renders layout='inner' with rail (MealRail from the sample week, counts from the list) else phone. One component instance, so the meal filter (useState selectedMealId) survives a width change.
2. Filter: items carry Item.badges (meal ids); toListItem maps ids to sample-week meals as mealBadges. Choosing a meal narrows sections to its to-buy items, passes filter {mealName,count,tone,onShowAll}; template hides In the cart while filtered (Bruk's decision). Phone layout shows the same filter line.
3. Rail wiring: onSelectSection plan -> go.plan; onPlanMeal -> go.addMeal.
4. Demo seed: give sample items badges by sample-week meal ids (chana m1, chicken m2).
5. Tests: route tests at 411 and 791 wide, filter survives resize, demo route test choosing a meal. route-setup pins the default window at 412 so existing tests keep the phone layout.
6. Criterion 4 needs the Fold: cannot be met here; recorded in notes.
Modified files: apps/mobile/src/screens/GroceriesScreen.tsx, apps/mobile/src/sample/sample-data.ts, apps/mobile/src/demo/compose-demo.ts, apps/mobile/src/demo/demo.route.test.tsx, apps/mobile/src/routes/groceries-rail.route.test.tsx, apps/mobile/testing/route-setup.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bruk, 2026-10-21: while a meal is chosen the In the cart section stays hidden; it comes back with Show all (as TASK-1.31.1's template already does).

Worker report (builder-app). Checks: pnpm typecheck clean; pnpm check passed (14 checks); pnpm test 116 files / 1539 tests passed. GitHub Actions not run (billing).
#1: apps/mobile/src/routes/groceries-rail.route.test.tsx: rail present at 791 dp and 600 dp, absent at 412 and 599 (switch at 600 via GroceriesScreen INNER_MIN_WIDTH).
#2: same file: meal chosen at 791, fold to 412 (filter line + Show all stay, list stays narrowed), unfold to 791 (still filtered); also chosen at inner then folded. State lives in GroceriesScreen above the width switch, so one instance survives.
#3: demo seed (compose-demo.ts) gives items badges as sample-week meal ids (Chana masala m1, Sheet-pan chicken m2) from the sample items' badges; GroceriesScreen shows them as mealBadges. demo.route.test.tsx: badges shown, choosing Sheet-pan chicken in the rail leaves Bell peppers/Chicken thighs and hides Garlic, Show all restores. In the cart is hidden while filtered, back with Show all (Bruk's decision, template behaviour).
#4 NOT MET: needs Bruk's Pixel 10 Fold; no device or screenshots available to me. Route tests only prove the logic in jsdom. Needs a device check by Bruk.
Test infra: route-setup.ts now makes jsdom's documentElement.clientWidth follow window.innerWidth (react-native-web reads it; it was 0) and resets to 412 dp before each test, so existing tests keep the phone layout. Live (non-demo) lists have no badges yet, so their rail counts are 0 until TASK-1.21.
<!-- SECTION:NOTES:END -->
