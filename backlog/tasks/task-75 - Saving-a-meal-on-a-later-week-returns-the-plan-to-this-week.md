---
id: TASK-75
title: Saving a meal on a later week returns the plan to this week
status: To Do
assignee: []
created_date: '2026-11-07 13:32'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by TASK-65's full-week run of e2e/add-meal.yaml, 2026-11-07 (iPhone 18 Pro simulator). PlanScreen keeps the viewed week in local state (weekOffset); AddMealScreen returns with go.plan(), which remounts the plan on the current week, so a meal just planned for next week is out of sight. Repro: Meal plan > Next week > Plan a meal > type a name > Add: the plan shows this week. Likely fix: carry the day's week back (a route param) or return with router.back(). add-meal.yaml steps forward to find the meal until this is fixed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After adding or editing a meal on a later week, the plan shows that week with the meal on it
<!-- AC:END -->
