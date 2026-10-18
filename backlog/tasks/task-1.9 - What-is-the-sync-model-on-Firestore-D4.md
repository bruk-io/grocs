---
id: TASK-1.9
title: What is the sync model on Firestore? (D4)
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:01'
labels:
  - size-3
  - architecture
milestone: m-1
dependencies:
  - TASK-1.4
  - TASK-1.16
references:
  - >-
    backlog/decisions/decision-7 -
    Sync-an-append-only-change-log-folded-in-core-ordered-by-a-hybrid-logical-clock.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D4 in doc-1: document shapes, field-level merges, tombstones, the activity outbox and schema versions, including how a shape change bumps its version with a migration test (R15 to R22, R30, R54). Firebase is decided (decision-1).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-7 on 2026-10-18. Fixes the skeleton's offline gap (R16) with an append-only change log. Waiting on Bruk, and on spike TASK-1.16, whose eight checks are listed in the decision.
<!-- SECTION:NOTES:END -->
