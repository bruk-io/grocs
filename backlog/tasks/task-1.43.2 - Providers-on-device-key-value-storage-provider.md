---
id: TASK-1.43.2
title: 'Providers: on-device key-value storage provider'
status: To Do
assignee: []
created_date: '2026-10-25 17:22'
updated_date: '2026-10-25 17:24'
labels:
  - layer-providers
  - size-2
dependencies:
  - TASK-1.43.1
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1.43
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implements the new key-value storage port (prerequisite task) against a real on-device store, so the logging buffer and decision-7's device id both have something to write to.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 a providers-device implementation of the key-value port exists, backed by a standard on-device persistence mechanism (e.g. AsyncStorage or equivalent already available to the app), and passes the port's contract suite
- [ ] #2 wired into the composition root (apps/mobile/src/composition/native.ts) alongside the other device providers (clock, ids)
<!-- AC:END -->
