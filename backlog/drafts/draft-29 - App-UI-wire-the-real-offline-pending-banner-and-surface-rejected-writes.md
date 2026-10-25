---
id: DRAFT-29
title: 'App/UI: wire the real offline/pending banner and surface rejected writes'
status: Draft
assignee: []
created_date: '2026-10-25 16:16'
labels:
  - layer-app
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
The 'Offline. N changes waiting' banner only exists today as hardcoded sample data on the demo route (R21); nothing reads real connectivity or pending-write state. Decision-7 adds watchSyncState({connected, pending}) and watchRejections for exactly this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GroceriesScreen and PlanScreen show a real Offline / N changes waiting banner driven by watchSyncState, matching the states already designed in the demo samples
- [ ] #2 a write the security rules reject surfaces as a visible message instead of disappearing silently - decision-7 flags the exact wording as still open; this task settles it
<!-- AC:END -->
