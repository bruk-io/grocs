---
id: TASK-1.23.6
title: 'App: Clear the cart on Groceries dispatches ClearCart'
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-21 12:09'
updated_date: '2026-10-21 12:09'
labels:
  - size-2
  - layer-app
dependencies: []
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13, R14. Delivers the app part of TASK-1.23 #3, after TASK-1.23.4 (core) and TASK-1.23.5 (the ClearCart application command). GroceryListTemplate already takes onClearCart and CartSection shows the button when it is given. Pulled ahead of TASK-1.22 like ticking, at Bruk's request to finish what the demo can show.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Pressing Clear on In the cart dispatches ClearCart for the week and the cleared items leave Groceries, proved by a route test on the fakes
- [ ] #2 The demo route test ticks a sample item, clears the cart and finds it gone
- [ ] #3 A failed clear shows the screen's banner and leaves the cart as it was
<!-- AC:END -->
