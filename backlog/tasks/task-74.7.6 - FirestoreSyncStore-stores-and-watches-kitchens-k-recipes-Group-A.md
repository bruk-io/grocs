---
id: TASK-74.7.6
title: 'FirestoreSyncStore stores and watches kitchens/{k}/recipes - Group A'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.7.4
  - TASK-74.7.2
  - TASK-74.7.3
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §15, as a member of Group A. It edits the shared worktree and does NOT commit. Writes use a transaction (decode, then merge, then encode, all from core). getRecipes and watchRecipes read the whole collection with no where clause. A bad doc goes to onError while valid docs are still delivered, as with meals. Builders cannot run emulator tests, so orch-emulator-suite runs them. Covers TASK-74.7 AC#3 (the Firestore provider).

Split key: providers-firestore-recipes. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FirestoreSyncStore implements the three methods at kitchens/{k}/recipes/{id}, using decodeRecipe, mergeRecipe and encodeRecipe
- [ ] #2 firestore-sync-store.emulator.test.ts also runs syncStoreRecipeContract
- [ ] #3 Stored-shape tests: readRaw shows schemaVersion 1 and plain content fields; a bad or future-version doc written with writeRaw makes getRecipes reject; the watcher reports the invalid doc and still delivers valid ones
- [ ] #4 The offline note in the class doc also covers recipes, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add a decodeAllRecipes helper, then the three methods, then the contract call and the stored-shape tests.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-firebase/src/firestore-sync-store.ts
- packages/providers-firebase/src/firestore-sync-store.emulator.test.ts
<!-- SECTION:PLAN:END -->
