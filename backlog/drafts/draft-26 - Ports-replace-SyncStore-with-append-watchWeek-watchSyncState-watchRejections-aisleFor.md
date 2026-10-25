---
id: DRAFT-26
title: >-
  Ports: replace SyncStore with
  append/watchWeek/watchSyncState/watchRejections/aisleFor
status: Draft
assignee: []
created_date: '2026-10-25 16:15'
labels:
  - layer-ports
  - sync
dependencies:
  - TASK-1.9
references:
  - >-
    backlog/decisions/decision-7 -
    Sync-an-append-only-change-log-folded-in-core-ordered-by-a-hybrid-logical-clock.md
parent_task_id: TASK-1.24
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current SyncStore port (mergeItem/getItems/watchItems, mergeMeal/getMeals/watchMeals) models reading and writing whole documents, with no room for decision-7's fire-and-forget, offline-safe append. Decision-7 replaces the interface rather than extending it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 the new port interface matches decision-7's shape: append(kitchenId, changes, projections?), watchWeek(kitchenId, weekId, onChanges), watchSyncState(kitchenId, onState), watchRejections(kitchenId, onRejected), aisleFor(kitchenId, nameKey), each documented with the guarantee it makes (e.g. append returns once the batch is in the local cache, never waiting for the server)
- [ ] #2 the fake implementation and the contract test suite are rewritten to match, covering kitchen isolation and idempotence the same way the current suites do, plus the offline-return guarantee
- [ ] #3 every current caller of the old SyncStore interface is identified, so the application-layer task's scope is accurate; this task does not change those callers itself
<!-- AC:END -->
