---
id: TASK-1.21.3
title: 'Application: meal commands and the watchWeekMeals query'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
labels:
  - layer-application
  - size-2
dependencies:
  - TASK-1.21.2
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Application-layer commands dispatching onto the SyncStore port's new meal methods, mirroring packages/application/src/commands/add-item.ts and packages/application/src/queries/find-my-kitchen.ts's shapes. Depends on the ports contract (TASK-1.21.2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AddMeal, EditMeal (rename+relink together, matching AddMealScreen's single name+link form), RemoveMeal and MoveMeal commands in packages/application/src/commands/
- [ ] #2 A watchWeekMeals query in packages/application/src/queries/, mirroring watch-week-items.ts
- [ ] #3 Every command requires a signed-in member (same not-signed-in error shape as AddItem) and is registered in commandHandlers; exported from packages/application/src/index.ts
- [ ] #4 Unit tests for every command and the query, including the empty-name and not-signed-in error paths
<!-- AC:END -->
