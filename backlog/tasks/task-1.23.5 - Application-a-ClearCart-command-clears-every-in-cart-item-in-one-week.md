---
id: TASK-1.23.5
title: 'Application: a ClearCart command clears every in-cart item in one week'
status: To Do
assignee: []
created_date: '2026-10-21 11:11'
updated_date: '2026-10-21 11:11'
labels:
  - layer-application
  - size-2
dependencies:
  - TASK-1.23.4
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-1.23 #3, depends on TASK-1.23.4 (core). Matches decision-13's pattern (a command, dispatched, never a direct store write) and TASK-1.23.2's shape (SetItemState) for the per-item mechanics: read the week's items (syncStore.getItems), find every one whose state is in-cart, clearFromCart each with one stamp (same clock reading, same signed-in member), and mergeItem each back - the existing per-item SyncStore port has no bulk write, so this is N transactional per-item merges, the same as N individual ticks would be. Clearing an already-empty cart is not an error - zero in-cart items means zero events, successfully.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ClearCart { kitchenId, weekId } reads the week's items, clears every in-cart one with the clock and signed-in member's stamp, merges each back through the sync store, and returns the not-signed-in error code when nobody is signed in
- [ ] #2 It returns one CartCleared event naming every cleared item's id (empty when there was nothing to clear - not an error), with a scenario test covering several in-cart items, items that are not in-cart being left alone, and the empty-cart case
- [ ] #3 It is registered in commandHandlers and its types are exported from @grocs/application
<!-- AC:END -->
