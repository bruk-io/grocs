---
id: TASK-1.22.7
title: 'Application: AddItem uses the aisle memory; SetItemAisle; suggestAisle'
status: To Do
assignee:
  - '@builder-application'
created_date: '2026-11-08 20:21'
labels:
  - layer-application
  - size-3
dependencies:
  - TASK-1.22.5
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AddItem with no aisle takes the remembered one, else the default; with an aisle it remembers it
- [ ] #2 SetItemAisle stamps the item and remembers the aisle
- [ ] #3 A scenario test proves a cleared item's aisle is still suggested (R14)
- [ ] #4 suggestAisle returns the remembered aisle or null
<!-- AC:END -->
