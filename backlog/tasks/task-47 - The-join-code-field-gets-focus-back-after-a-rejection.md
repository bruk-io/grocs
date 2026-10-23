---
id: TASK-47
title: The join code field gets focus back after a rejection
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 20:31'
updated_date: '2026-10-23 00:46'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-21's criterion by the orchestrator. InviteRetryTemplate disables its field while a code is checked, which drops focus on the web (and dismisses the keyboard on a phone), so after a rejection the person has to tap the field again. The template has no way to give the field focus back.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After a rejection the code field has focus again, shown by a behaviour test
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 2 rather than 1 on acceptance (2026-10-22): whether TextField can take focus from its parent (a forwarded ref or a prop) is not yet known.
<!-- SECTION:NOTES:END -->
