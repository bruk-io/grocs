---
id: TASK-1.22.4
title: 'Core: aisles, grouping and changing an item''s aisle'
status: To Do
assignee:
  - '@builder-core'
created_date: '2026-11-08 20:21'
labels:
  - layer-core
  - size-2
dependencies: []
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 core exports AISLES, aisleSection, groupByAisle, aisleNameKey and setItemAisle as the contract says, with unit tests including an unknown aisle grouping as other
- [ ] #2 setItemAisle's stamp merges by the existing last-write-wins rule
<!-- AC:END -->
