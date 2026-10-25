---
id: TASK-1.43.1
title: 'Ports: a local key-value storage port (R28)'
status: To Do
assignee: []
created_date: '2026-10-25 17:22'
updated_date: '2026-10-25 17:24'
labels:
  - layer-ports
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
R28 lists local key-value storage among the SDK's ports, but none exists yet (packages/ports/src has no kv module). It's a prerequisite for two things already decided: decision-8's persisted log buffer (R35) and decision-7's device installation id, which it says is 'kept in local key-value storage'. This task builds the port itself, a fake and a contract suite - not a concrete provider, and not either caller.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 a KeyValueStore (or similarly named) port interface exists in packages/ports/src, with get/set/delete (or equivalent) operating on string keys and values, documented with the guarantee each makes
- [ ] #2 a fake implementation and a contract test suite exist, following this repo's existing port/fake/contract pattern (see packages/ports/src/sync-store/ for the shape)
<!-- AC:END -->
