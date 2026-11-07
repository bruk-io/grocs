---
id: TASK-74.7.5
title: MemorySyncStore stores and watches recipes - Group A
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.7.4
  - TASK-74.7.3
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §14 (the sync-store half), as a member of Group A. It edits the shared worktree after ports-sync-store-recipes and does NOT commit. The decision-12 demo build needs a working MemorySyncStore. syncStoreRecipeContract is wired by hand, because port-contracts does not force it. Covers TASK-74.7 AC#3 (the memory provider).

Split key: providers-memory-recipes. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MemorySyncStore implements mergeRecipe, getRecipes and watchRecipes (a third Map, watchers filtered by kitchen only, queueMicrotask)
- [ ] #2 memory-sync-store.test.ts also runs syncStoreRecipeContract
- [ ] #3 vitest --project unit packages/providers-memory passes in the shared worktree, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the recipe Map and watchers, then wire the contract.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-memory/src/memory-sync-store.ts
- packages/providers-memory/src/memory-sync-store.test.ts
<!-- SECTION:PLAN:END -->
