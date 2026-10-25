---
id: DRAFT-28
title: >-
  Application: commands build changes and append instead of awaiting a
  transactional merge
status: Draft
assignee: []
created_date: '2026-10-25 16:16'
labels:
  - layer-application
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
Commands currently build a full document and await syncStore.mergeItem, which is why they hang or fail offline. Decision-7 has commands build changes from core's constructors (using nextStamp) against an in-memory WeekView (from foldWeek) and call append, returning once the change is in the local cache.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 every command that currently calls mergeItem/mergeMeal (AddItem, the meal commands, SetItemState, ClearCart) is rewritten to build a Change via core's constructors and call append; none of them await the server
- [ ] #2 queries read the in-memory WeekView via foldWeek over watchWeek's changes, not getItems/getMeals
- [ ] #3 the two-client emulator scenario (R15: an item added on one client reaches a second within budget) still passes against the new append-based flow
<!-- AC:END -->
