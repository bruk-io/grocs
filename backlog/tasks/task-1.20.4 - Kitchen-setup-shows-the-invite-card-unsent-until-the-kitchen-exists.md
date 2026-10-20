---
id: TASK-1.20.4
title: Kitchen setup shows the invite card unsent until the kitchen exists
status: To Do
assignee: []
created_date: '2026-10-20 12:42'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-19
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-17 (its criterion 2) so the clipboard seam could merge for TASK-1.28. Once TASK-19 gives InviteCard and KitchenSetupTemplate an unsent state, KitchenSetupScreen uses it before CreateKitchen runs, so Share link and Copy code are disabled rather than dead. Numbered steps are written once TASK-19's API exists.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Before a kitchen exists, kitchen setup shows the invite card unsent, with Share link and Copy code disabled, shown by a route test
- [ ] #2 After Start planning the card shows the real code with both buttons live, and the existing kitchen route tests pass unchanged
<!-- AC:END -->
