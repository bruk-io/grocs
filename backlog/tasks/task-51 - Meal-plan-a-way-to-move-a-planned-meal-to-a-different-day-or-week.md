---
id: TASK-51
title: 'Meal plan: a way to move a planned meal to a different day or week'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-25 00:04'
updated_date: '2026-10-25 00:04'
labels:
  - size-3
dependencies:
  - TASK-1.21.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.21's own AC3 asks for moving meals between weeks, and the backend fully supports it (MoveMeal application command, tested; mergeMeal/moveMeal in core and ports/providers all handle a weekId+dayIndex change correctly) - but no UI affordance exists anywhere to trigger it. Found by builder-app while wiring TASK-1.21.6 (app layer, end-to-end): grepped all of packages/ui/src and confirmed WeekList/DayRow expose only onOpenMeal and onPlan, and MealFormTemplate has no day/week picker, drag target, or any other way for a person to actually move a meal. Needs real design thought (a day picker in the edit form? drag within the week view? something else?), not a mechanical wire-up, which is why it's split out rather than blocking TASK-1.21.6's otherwise-complete end-to-end wiring of add/rename/relink/remove.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A real user-reachable affordance exists for moving a planned meal to a different day, within the same week or a different one
- [ ] #2 It dispatches the existing MoveMeal command (packages/application/src/commands/move-meal.ts) - no new application-layer work needed, this is UI + app wiring only
- [ ] #3 A route test proves the affordance dispatches MoveMeal with the right weekId/dayIndex, closing TASK-1.21's own AC3 for real
<!-- AC:END -->
