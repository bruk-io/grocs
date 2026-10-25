---
id: TASK-1.43.7
title: >-
  Application: describeError keeps the message for a GrocsError, withholds
  everything else
status: To Do
assignee: []
created_date: '2026-10-25 17:23'
updated_date: '2026-10-25 17:24'
labels:
  - layer-application
  - size-1
dependencies:
  - TASK-1.43.4
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1.43
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Follows the new GrocsError class (prerequisite task). describeError in packages/application/src/instrumentation/instrument.ts currently withholds every error's message unconditionally - decision-8's design keeps the real message only for a GrocsError instance; every other error (SDK, platform) keeps showing '[sdk message withheld]', with its code carrying the meaning instead.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 describeError keeps the real message for a GrocsError instance and continues withholding it ('[sdk message withheld]') for everything else, with a test proving both cases
<!-- AC:END -->
