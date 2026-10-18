---
id: TASK-1.24
title: 'Offline and conflicts: nothing is lost or undone in a basement store'
status: To Do
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:18'
labels:
  - size-8
  - slice
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.23
  - TASK-1.9
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
- [ ] #5 Changing a stored shape bumps its schema version and adds a migration test (R54)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: added the R54 criterion, which no task cited.
<!-- SECTION:NOTES:END -->
