---
id: TASK-1.21.7
title: 'Week navigation: PlanScreen can view and plan a future or past week'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-25 01:21'
updated_date: '2026-10-25 03:32'
labels:
  - layer-app
  - size-2
dependencies:
  - TASK-1.21.6
modified_files:
  - apps/mobile/src/screens/PlanScreen.tsx
  - apps/mobile/src/routes/meal-plan.route.test.tsx
parent_task_id: TASK-1.21
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.21's own AC1 ('adds meals to any day of this week or a future one') is blocked on this: PlanScreen.tsx always shows weekIdFor(app.now()) with no way to view a different week. MealPlanTemplate already has onPreviousWeek/onNextWeek props (packages/ui/src/templates/MealPlanTemplate.tsx) - the UI affordance exists, it's just never wired. Needs PlanScreen to hold which week is being viewed (not always 'now'), compute that week's weekLabel, and pass the viewed week's weekId to watchWeekMeals and to AddMealScreen's route (so 'Plan a meal' on a future week's day adds to that week, not always the current one).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 PlanScreen shows Previous/Next week controls that change which week's meals are displayed
- [x] #2 Adding a meal from a non-current week's day plans it on that week, not the current one
- [x] #3 A route test proves navigating to next week and adding a meal there persists it under the correct weekId
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/PlanScreen.tsx: add weekOffset state, derive viewedAt = app.now() + weekOffset * 7 * 86_400_000, replace app.now() with viewedAt in weekDays() and weekLabelFor() calls.
2. Wire onPreviousWeek/onNextWeek on MealPlanTemplate to setWeekOffset(n => n -1 / n+1). No bounds on weekOffset.
3. apps/mobile/src/routes/meal-plan.route.test.tsx: add a test that clicks 'Next week' (WeekNav's accessible button name, confirmed in packages/ui/src/molecules/WeekNav.tsx), plans a meal on the now-visible week, and asserts via syncStore.getMeals that the meal lands under the week-after weekId, not the original.
4. Run pnpm test (full suite), pnpm check, pnpm typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented: PlanScreen holds weekOffset state (unbounded, no min/max), derives viewedAt = app.now() + weekOffset*7*86_400_000, feeds weekDays/weekLabelFor for the meals displayed/planned and wires MealPlanTemplate's onPreviousWeek/onNextWeek to it. go.addMeal(dayId) already carries the viewed week's real date, and AddMealScreen/dayFor already derive weekId from dayId, so no other app file needed a change.

Decision: items/toBuy badge were kept on the CURRENT week (weekIdFor(app.now())), not the viewed week - GroceriesScreen (what onOpenGroceries opens) always shows app.now()'s week with no week param, so coupling the badge to the viewed week would show a count that doesn't match where tapping it lands. New currentWeekId binding added alongside the viewed weekId.

Known, accepted behavior (task's own risk note): weekOffset resets to 0 on remount, so returning from AddMealScreen after planning a meal on a future week lands back on the current week and the just-added meal isn't visible until navigating forward again. The new route test exercises this explicitly (saves, confirms back on 'This week', clicks Next week again, then finds the meal). Not a bug to fix here.

Follow-up for the orchestrator (packages/ui, outside this layer's write boundary): MealPlanTemplate hardcodes title="This week" regardless of which week is being viewed - worth a follow-up task so the header doesn't read 'This week' while showing a different week's label.

pnpm test (full suite, 126 files / 1648 tests), pnpm check (14 checks), pnpm typecheck all green.
<!-- SECTION:NOTES:END -->
