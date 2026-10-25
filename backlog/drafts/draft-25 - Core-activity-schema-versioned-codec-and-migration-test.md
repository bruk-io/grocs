---
id: DRAFT-25
title: 'Core: activity schema, versioned codec and migration test'
status: Draft
assignee: []
created_date: '2026-10-25 16:15'
labels:
  - layer-core
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
Decision-7 makes each change document the activity record and the only persisted record of a week - there is no 'current state' document to re-derive from, and change documents are never rewritten, so every schema version must stay decodable forever (R30, R54).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/core/src/schema/activity.ts exports ACTIVITY_SCHEMA_VERSION, encodeChange and decodeChange covering every kind decision-7 lists (item.added/set/badged/deleted, meal.added/set/deleted, pair.declined)
- [ ] #2 decodeChange accepts every version up to the current one and upgrades older versions step by step; a version newer than the app's decodes to unsupported-version instead of throwing
- [ ] #3 schema/fixtures/activity.v<n>.json holds a sample of each kind as written at version n, and activity.migration.test.ts decodes every fixture with the current codec and asserts the result
<!-- AC:END -->
