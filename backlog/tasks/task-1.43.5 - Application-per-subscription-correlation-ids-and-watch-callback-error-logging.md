---
id: TASK-1.43.5
title: 'Application: per-subscription correlation ids and watch-callback error logging'
status: To Do
assignee: []
created_date: '2026-10-25 17:23'
updated_date: '2026-10-25 17:24'
labels:
  - layer-application
  - size-2
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
instrumentPort's Proxy only wraps a port method's own call/promise, not callbacks passed into it - so a watch* subscription's later onError delivery is never logged, and every subscription shares its command's correlation id rather than getting its own. decision-8's design: each subscription gets its own 'watch-<id>' correlation id, logged once at {port, method} when it starts; a later onError (or, once decision-7 lands, a watchRejections delivery) logs {port, method, outcome: 'error', error} at warn with that subscription's own correlation id.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 watchItems and watchMeals (and any other watch* port method) log once when the subscription starts, with its own correlation id distinct from the command that opened it
- [ ] #2 an error delivered later to that subscription's onError is logged at warn with the subscription's correlation id, port and method - proven by a test that triggers onError and checks the log record
<!-- AC:END -->
