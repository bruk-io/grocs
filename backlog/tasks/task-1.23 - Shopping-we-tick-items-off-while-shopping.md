---
id: TASK-1.23
title: 'Shopping: we tick items off while shopping'
status: To Do
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-10-20 22:51'
labels:
  - size-3
  - slice
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.22
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the grocery list slice. Cites R13, R14, R17, R18.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ticking moves an item to In the cart, unticking moves it back
- [ ] #2 When we both tick the same item it ends in the cart; when one ticks and the other unticks, the later action wins
- [ ] #3 Clear the cart removes in-cart items from the week's view and keeps them for suggestions
- [ ] #4 End-to-end flows cover signing in, adding a meal, adding an item, ticking it and the change reaching a second device, on development builds against the emulators (R51)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: added the R51 criterion, which no task cited. Shopping is the first slice where every flow it names exists.

2026-10-20: #1 (ticking) split out as TASK-1.23.1 (core), 1.23.2 (application) and 1.23.3 (app) and pulled ahead of TASK-1.22 at Bruk's request, so the demo APK's tick boxes work. They need no meal or list slice. #2-#4 stay here and still wait on TASK-1.22.
<!-- SECTION:NOTES:END -->
