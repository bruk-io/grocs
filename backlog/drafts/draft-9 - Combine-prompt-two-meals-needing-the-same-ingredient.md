---
id: DRAFT-9
title: 'Combine prompt: two meals needing the same ingredient'
status: Draft
assignee: []
created_date: '2026-10-18 18:16'
labels:
  - size-3
  - slice
milestone: m-3
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on D1 and the grocery list slice. Cites R12.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Adding an item that matches one already on the list shows the inline prompt on the existing item, without a dialog
- [ ] #2 Combining leaves one item with every badge and both amounts as written; declining keeps both and the prompt doesn't return for that pair
<!-- AC:END -->
