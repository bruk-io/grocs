---
id: DRAFT-24
title: 'Core: hybrid logical clock stamps and the change-log fold'
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
Today's merge (packages/core/src/merge/) merges two full copies of one document and assumes a document can be read then written, which decision-7 found breaks offline (Firestore transactions fail offline - see the doc comment already in firestore-sync-store.ts). Decision-7 replaces it with an append-only change log folded in core by a hybrid logical clock, so the order changes arrive in never matters (R16, R18, R46).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 nextStamp(now, seen, by, dev) always returns a stamp later than anything the caller has seen, with property tests proving that guarantee under clock drift and ties, per decision-7's clock section
- [ ] #2 foldWeek(changes) folds a week's changes into the current item/meal view per decision-7: last-write-wins per field from item.added onward, badges are a grow-only union, deleted is permanent and ignores all later changes (R20), cleared is an ordinary LWW field
- [ ] #3 property tests prove the fold is commutative, associative and idempotent under any shuffle, duplication or split of the change list (R46); a delete is never undone; two item.added with the same name always stay two items (R19)
<!-- AC:END -->
