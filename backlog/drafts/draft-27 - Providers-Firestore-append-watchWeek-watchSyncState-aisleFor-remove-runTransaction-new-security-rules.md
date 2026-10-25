---
id: DRAFT-27
title: >-
  Providers: Firestore append/watchWeek/watchSyncState/aisleFor, remove
  runTransaction, new security rules
status: Draft
assignee: []
created_date: '2026-10-25 16:16'
labels:
  - layer-providers
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
FirestoreSyncStore.mergeItem/mergeMeal use runTransaction, which fails offline - decision-7's own diagnosis (see the doc comment already in firestore-sync-store.ts: 'making R16 work is part of design question D4'). The provider is rewritten against the new port using writeBatch (not awaited) and onSnapshot with includeMetadataChanges; the security rules move from one generic per-kitchen rule to activity-specific create/no-real-update/never-delete rules plus the aisles LWW-by-stamp rule.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 append uses writeBatch, one set per change, and calls commit() without awaiting it; a rejected commit is reported through watchRejections
- [ ] #2 watchWeek is onSnapshot(query(activity, where weekId), {includeMetadataChanges: true}) decoding every document with core's codec; watchSyncState derives connected from !metadata.fromCache and pending from documents with hasPendingWrites
- [ ] #3 firestore.rules enforces activity's create conditions (membership, actorUid==stamp.by==auth.uid, known schemaVersion/kind, payload shape per kind, name/link length limits, stamp.at no more than 10 minutes ahead of request.time), update-only-if-identical, and never-delete; aisles writes only when the new stamp is later than the stored one; each rule has allow and deny tests (R49)
- [ ] #4 no use of runTransaction remains in this package
<!-- AC:END -->
