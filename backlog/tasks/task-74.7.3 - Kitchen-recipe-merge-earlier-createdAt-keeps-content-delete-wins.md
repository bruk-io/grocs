---
id: TASK-74.7.3
title: 'Kitchen recipe merge: earlier createdAt keeps content, delete wins'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-core
dependencies:
  - TASK-74.3.1
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §4 and §0.6, decision-16 and R20/R46. No mergeStamped is used. Trap: `first` has no content tiebreak, so the property arbitrary must hold content constant per recipe id, with the reason written in the test. Covers TASK-74.7 AC#2.

Split key: core-recipe-merge. Layer: core. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 merge/recipe-merge.ts exports mergeRecipe and isRecipeDeleted as in contract §4, and mergeRecipe throws on different ids
- [ ] #2 Example tests: the earlier createdAt wins addedBy and createdAt; a delete on either copy wins; a later copy with deleted:null (a re-import) never clears a tombstone; different ids are refused
- [ ] #3 fast-check properties: order independence (forward vs reversed fold), any shuffle, idempotence, associativity and delete-never-undone, using an arbitrary with fixed id and content, members alex|sam and at 0..12
- [ ] #4 Exported from packages/core/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/core passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Copy meal-merge's `first` selection and its use of laterStamp.
2. Write the example tests, then the property tests modelled on meal-merge.test.ts.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/core/src/merge/recipe-merge.ts
- packages/core/src/merge/recipe-merge.test.ts
- packages/core/src/index.ts
<!-- SECTION:PLAN:END -->
