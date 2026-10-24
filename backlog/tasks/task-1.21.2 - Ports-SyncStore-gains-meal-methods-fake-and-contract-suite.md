---
id: TASK-1.21.2
title: 'Ports: SyncStore gains meal methods, fake and contract suite'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
labels:
  - layer-ports
  - size-2
dependencies:
  - TASK-1.21.1
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extends the existing SyncStore port (the kitchen's shared data) with meal methods, the same way it already holds item methods - not a new gateway, since meals and items share identical sync/merge/offline semantics. Depends on the core meal model landing first (the frozen contract).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/ports/src/sync-store/port.ts's SyncStore gains mergeMeal(kitchenId, meal), getMeals(kitchenId, weekId), watchMeals(kitchenId, weekId, onMeals, onError), matching the shape of the existing item methods
- [ ] #2 packages/ports/src/sync-store/fake.ts implements the new methods in-memory
- [ ] #3 packages/ports/src/sync-store/contract.ts gains tests for create, rename, relink, move between weeks, remove (tombstone), and a concurrent-edit merge case, run against the fake
<!-- AC:END -->
