---
id: TASK-1.37.5
title: The rest of the screens
status: To Do
assignee: []
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 03:19'
labels:
  - size-5
  - layer-app
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.3
  - TASK-1.37.4
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: added decision-11's route tests, after Bruk asked for the right level of testing in the UI build.
<!-- SECTION:NOTES:END -->
