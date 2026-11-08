---
id: TASK-1.22.6
title: 'Providers: Firestore and memory stores keep the aisle memory'
status: To Do
assignee:
  - '@builder-providers'
created_date: '2026-11-08 20:21'
labels:
  - layer-providers
  - size-2
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
- [ ] #1 Both stores pass the aisle contract, the Firestore one on the emulator, in decision-7's kitchens/{k}/aisles/{nameKey} shape
- [ ] #2 A rules test proves a non-member cannot read or write the aisle memory
<!-- AC:END -->
