---
id: TASK-1.22.8
title: 'UI: amount and aisle on the picker, and changing an aisle from a row'
status: To Do
assignee:
  - '@builder-ui'
created_date: '2026-11-08 20:21'
labels:
  - layer-ui
  - size-3
dependencies: []
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11, R38. See TASK-1.22's slice contract. Baselines come from the workflow afterwards; the orchestrator does that.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ItemPickerTemplate shows an optional amount field and aisle chips, with stories and behaviour tests
- [ ] #2 Pressing a to-buy row shows aisle chips inline, choosing one calls back with the row and aisle, with stories and behaviour tests
- [ ] #3 ui takes aisle options as data and does not import core
<!-- AC:END -->
