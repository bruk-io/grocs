---
id: TASK-1.23.2
title: 'Application: a SetItemState command ticks an item into the cart and back'
status: In Progress
assignee:
  - '@builder-application'
created_date: '2026-10-20 22:51'
updated_date: '2026-10-20 23:35'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-1.23.1
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13, R14, R47. Delivers the application part of TASK-1.23 #1 (decision-13's pattern: the app dispatches a command, never writes the store). Pulled forward on 2026-10-20 at Bruk's request: the demo APK shows tick boxes that do nothing. Ticking (TASK-1.23 #1) needs no meal or grocery-list slice, so these three tasks do not wait on TASK-1.22. #2 (both phones), #3 (clear the cart) and #4 (end-to-end on dev builds) stay with TASK-1.23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 SetItemState { kitchenId, weekId, itemId, inCart } reads the week's items, restamps the item's state with the clock and signed-in member through setItemState, and merges it into the sync store
- [ ] #2 It returns an ItemMovedToCart or ItemMovedBack event, and the error codes not-signed-in and item-not-found, each covered by a scenario test beside it (R47)
- [ ] #3 It is registered in commandHandlers and its types are exported from @grocs/application
<!-- AC:END -->
