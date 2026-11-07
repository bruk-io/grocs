---
id: TASK-74.7.5
title: MemorySyncStore stores and watches recipes - Group A
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:49'
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
1. Add a third Map (#recipes, keyed `${kitchenId}/${id}`) and a RecipeWatcher set to MemorySyncStore, mirroring the existing item/meal Map+watcher pattern: mergeRecipe uses core mergeRecipe on the existing copy, getRecipes/#selectRecipes filters by kitchenId prefix only (no week), watchRecipes registers a watcher and notifies via queueMicrotask, filtered by kitchen only (per contract §14).
2. Wire syncStoreRecipeContract into memory-sync-store.test.ts alongside the existing syncStoreContract/syncStoreMealContract calls, same subject shape.
3. Run vitest --project unit packages/providers-memory and pnpm -s typecheck in the shared worktree; do not commit.

### Risks
Contract (TASK-74's plan §6/§14) is followed exactly: port.ts/contract.ts/fake.ts were already updated by TASK-74.7.4 in this shared worktree, so no port-layer change is needed here, only the memory provider and its test. No contract change needed.

### Proof
Each acceptance criterion is shown by test/command output recorded in the notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented in packages/providers-memory/src/memory-sync-store.ts: a third #recipes Map (key `${kitchenId}/${id}`), a #recipeWatchers Set, mergeRecipe (uses core mergeRecipe on existing copy), getRecipes/#selectRecipes (filtered by kitchenId prefix only, no week filter), watchRecipes (queueMicrotask notify, kitchen-only filter), following the same shape as the existing item/meal Maps. AC#1 met.

packages/providers-memory/src/memory-sync-store.test.ts now also calls syncStoreRecipeContract({ describe, it, expect }, ...) with the same subject as the other two contracts. AC#2 met.

Proof (run inside the shared worktree /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/group-a, no commit made):

$ mise exec -- pnpm exec vitest run --project unit packages/providers-memory
 Test Files  4 passed (4)
      Tests  57 passed (57)
(was 50 tests before the recipe contract was wired in; the extra 7 are syncStoreRecipeContract's cases, all passing.)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(clean, no errors)

git status shows memory-sync-store.ts and memory-sync-store.test.ts modified, nothing committed. AC#3 met.

No contract change was needed; port.ts/fake.ts/contract.ts/test-support.ts for the recipe methods were already present in the shared worktree from TASK-74.7.4.
<!-- SECTION:NOTES:END -->
