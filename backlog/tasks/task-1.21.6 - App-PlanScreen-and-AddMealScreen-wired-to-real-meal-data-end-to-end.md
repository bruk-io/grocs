---
id: TASK-1.21.6
title: 'App: PlanScreen and AddMealScreen wired to real meal data, end to end'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
labels:
  - layer-app
  - size-3
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
- [ ] #1 apps/mobile's App facade (compose-app.ts) gains watchWeekMeals
- [ ] #2 PlanScreen.tsx shows the real week's meals via watchWeekMeals instead of the sample week export; a new kitchen's plan starts blank
- [ ] #3 AddMealScreen.tsx dispatches AddMeal for a new meal and EditMeal (plus the new Remove action dispatching RemoveMeal) when opened for an existing one, via a route param
- [ ] #4 GroceriesScreen's meal badges/filter rail and QuickAddScreen's 'For a meal' chips both read the same real watchWeekMeals data instead of the sample week export, so the app never shows two different meal lists
- [ ] #5 A route test proves add/rename/relink/remove/move each dispatch the right command, mirroring GroceriesScreen's existing watchWeekItems test pattern; pnpm check, pnpm typecheck, pnpm test and pnpm test:emulator all green
<!-- AC:END -->
