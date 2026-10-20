---
id: TASK-1.28
title: Settings and diagnostics
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-20 17:17'
labels:
  - size-2
  - slice
  - finish-moved
milestone: m-3
dependencies:
  - TASK-1.4
  - TASK-1.18
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the skeleton. Cites R35.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Settings holds the notifications toggle, copy diagnostics and sign out
- [ ] #2 Copy diagnostics copies the recent log records from the on-phone buffer, with no personal content
- [ ] #3 Uncaught errors, unhandled rejections, render errors and screen changes are logged by handlers installed once at app start (R33)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: added the R33 criterion, which no task cited.
<!-- SECTION:NOTES:END -->
