---
id: TASK-74.7.4
title: 'SyncStore stores and watches kitchen recipes (port, fake, contract) - Group A'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - layer-ports
dependencies:
  - TASK-74.3.1
  - TASK-74.7.3
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §6 and §0.7. This is the first member of integration Group A. The orchestrator creates one shared worktree. This builder edits only ports and does NOT commit. providers-memory-recipes, providers-firestore-recipes and application-sync-literals then edit the same worktree, and orch-integrate-sync-store commits once everything is green. Repo typecheck is red in that worktree until the group finishes, which is expected. Run only packages/ports tests. Recipes are kitchen-wide, so there is no weekId. port.ts, fake.ts, contract.ts and fake.test.ts change together, because port-contracts/method-covered fires as soon as port.ts declares a method. Covers TASK-74.7 AC#3 (port, fake, contract).

Split key: ports-sync-store-recipes. Layer: ports. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 port.ts declares mergeRecipe, getRecipes and watchRecipes as direct method signatures on SyncStore, with doc comments in the existing style
- [ ] #2 InMemorySyncStore implements them with #recipes and #recipeWatchers, keyed ${kitchenId}/${id}, filtered by kitchen only, merged with core mergeRecipe, and notified via queueMicrotask, including an initial notify
- [ ] #3 contract.ts exports syncStoreRecipeContract and literally calls .mergeRecipe(, .getRecipes( and .watchRecipes(. It covers: stores and returns unchanged; merging the same copy twice changes nothing; two members importing the same recipeId give one record with the earlier createdAt; a delete wins and a later deleted:null copy does not undo it (R20); kitchens don't mix; a watcher sees current state, then a change; unsubscribe stops calls
- [ ] #4 fake.test.ts calls syncStoreRecipeContract, test-support.ts re-exports it, and vitest --project unit packages/ports passes in the shared worktree
- [ ] #5 No commit is made by this task. It hands the worktree to the next Group A builder through the task notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the methods to the port, then the fake, then the contract suite, then wire it in fake.test.ts and test-support.
2. Run the ports unit tests and write the hand-off note.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/ports/src/sync-store/port.ts
- packages/ports/src/sync-store/fake.ts
- packages/ports/src/sync-store/contract.ts
- packages/ports/src/sync-store/fake.test.ts
- packages/ports/src/test-support.ts
<!-- SECTION:PLAN:END -->
