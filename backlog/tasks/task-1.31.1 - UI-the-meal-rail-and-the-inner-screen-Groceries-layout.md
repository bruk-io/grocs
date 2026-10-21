---
id: TASK-1.31.1
title: 'UI: the meal rail and the inner-screen Groceries layout'
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-21 15:38'
updated_date: '2026-10-21 15:38'
labels:
  - size-3
  - layer-ui
dependencies: []
parent_task_id: TASK-1.31
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R43. Builds the ui half of decision-14 (option C, design/reference/D2-OptionC.dc.html). The app's width switch and filter state are TASK-1.31.2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A meal rail organism holds the navigation (Meal plan; Groceries with its remaining count) and This week's meals (All items, each meal with its day and item count, Plan a meal), with stories for nothing selected, a meal selected, and no meals yet
- [ ] #2 Groceries has an inner layout: the rail on the left, the list filling the rest and no floating tab bar, shown in the fold-inner baselines
- [ ] #3 GroceryListTemplate shows the filter line ('Only <meal> · n to buy' with Show all) and the empty-meal line ('Nothing on the list for <meal> yet.') in both the phone and inner layouts, with stories
- [ ] #4 Every rail control has a name and role the axe pass accepts and a 44 x 44 target
<!-- AC:END -->
