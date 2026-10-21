---
id: TASK-1.23.3
title: 'App: ticking on Groceries dispatches SetItemState'
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 22:51'
updated_date: '2026-10-21 00:29'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-1.23.2
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13. Delivers the app part of TASK-1.23 #1. Pulled forward on 2026-10-20 at Bruk's request: the demo APK shows tick boxes that do nothing. Ticking (TASK-1.23 #1) needs no meal or grocery-list slice, so these three tasks do not wait on TASK-1.22. #2 (both phones), #3 (clear the cart) and #4 (end-to-end on dev builds) stay with TASK-1.23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ticking an item on Groceries moves it to In the cart and unticking moves it back, proved by a route test on the fakes
- [ ] #2 The demo route test ticks a sample item and finds it in the cart
- [ ] #3 A failed tick shows the screen's banner and leaves the item where it was
<!-- AC:END -->
