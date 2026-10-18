---
id: DRAFT-6
title: 'Shopping: we tick items off while shopping'
status: Draft
assignee: []
created_date: '2026-10-18 18:16'
labels:
  - size-3
  - slice
milestone: m-2
dependencies: []
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
<!-- AC:END -->
