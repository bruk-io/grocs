---
id: DRAFT-13
title: The join code field gets focus back after a rejection
status: Draft
assignee: []
created_date: '2026-10-20 20:31'
labels:
  - size-1
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
