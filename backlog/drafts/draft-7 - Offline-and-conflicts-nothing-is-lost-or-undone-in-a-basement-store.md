---
id: DRAFT-7
title: 'Offline and conflicts: nothing is lost or undone in a basement store'
status: Draft
assignee: []
created_date: '2026-10-18 18:16'
labels:
  - size-8
  - slice
milestone: m-2
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the shopping slice and D4. Cites R16, R19, R20, R21. Sized 8, so it is split before it starts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Everything but signing in and joining works offline and survives restarts, then sends with no action from us
- [ ] #2 Matching items added by both of us offline show the combine prompt after sync, never a silent merge
- [ ] #3 A deleted item or meal never comes back
- [ ] #4 The app shows when it is offline and when changes are waiting to send
<!-- AC:END -->
