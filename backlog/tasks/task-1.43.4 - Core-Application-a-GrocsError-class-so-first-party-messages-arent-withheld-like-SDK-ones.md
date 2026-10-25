---
id: TASK-1.43.4
title: 'Core: a GrocsError class for messages that are safe to log'
status: To Do
assignee: []
created_date: '2026-10-25 17:23'
updated_date: '2026-10-25 17:24'
labels:
  - layer-core
  - size-1
dependencies: []
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1.43
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
describeError in instrument.ts withholds every error's message unconditionally today, with a comment saying so explicitly: 'Messages are withheld until GrocsError exists (decision-8): SDK text can quote document data.' decision-8's design: a GrocsError class for errors this codebase constructs itself, with messages written by us (ids only, never quoted user data), so the application-layer task that follows this one can tell those apart from SDK/platform errors and stop withholding them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/core/src/result/ exports a GrocsError class (or equivalent) for errors this codebase constructs itself, documented as carrying only ids in its message - never quoted user data
<!-- AC:END -->
