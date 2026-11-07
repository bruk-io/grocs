---
id: TASK-74.7.4
title: 'SyncStore stores and watches kitchen recipes (port, fake, contract) - Group A'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:29'
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
1. port.ts: add mergeRecipe, getRecipes, watchRecipes as direct SyncStore methods (doc comments matching existing style), importing Recipe from @grocs/core.
2. fake.ts: InMemorySyncStore gains #recipes (Map keyed `${kitchenId}/${id}`) and #recipeWatchers (Set, filtered by kitchenId only, no weekId), merged with core mergeRecipe, notified via queueMicrotask including an initial notify on subscribe (mirrors item/meal watcher pattern).
3. contract.ts: add syncStoreRecipeContract(t, make) calling .mergeRecipe(, .getRecipes(, .watchRecipes( literally, covering: stores/returns unchanged; merging same copy twice is a no-op; two members importing the same recipeId merge to one record keeping the earlier createdAt; a delete wins and a later deleted:null copy does not undo it (R20); kitchens don't mix; a watcher sees current state then a change; unsubscribe stops calls.
4. fake.test.ts: call syncStoreRecipeContract alongside the existing contracts. test-support.ts: re-export syncStoreRecipeContract.
5. Run `pnpm --dir .claude/worktrees/group-a exec vitest run --project unit packages/ports` and record output in notes. Do not commit (Group A hands off to the next builder).

### Risks
Recipes are kitchen-wide (no weekId), unlike items/meals - the watcher/selector logic must filter by kitchenId only. Follow TASK-74's slice contract exactly (section 6); any needed contract change goes in this task's notes and work stops (decision-3 mediation). Repo-wide typecheck may be red until Group A finishes; only ports unit tests are run here.

### Proof
Each acceptance criterion is shown by the vitest run for packages/ports (unit project), pasted into the task notes, plus the specific test names covering mergeRecipe/getRecipes/watchRecipes in the output.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented in the shared Group A worktree (/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/group-a), no commit made (hands off per AC#5):

- packages/ports/src/sync-store/port.ts: added mergeRecipe, getRecipes, watchRecipes as direct SyncStore methods (doc comments in the existing style), kitchen-wide (no weekId), importing Recipe from @grocs/core.
- packages/ports/src/sync-store/fake.ts: InMemorySyncStore gains #recipes (Map keyed `${kitchenId}/${id}`) and #recipeWatchers (Set, filtered by kitchenId only), merged with core mergeRecipe, notified via queueMicrotask including an initial notify on subscribe (mirrors the existing item/meal watcher pattern).
- packages/ports/src/sync-store/contract.ts: added syncStoreRecipeContract(t, make), calling .mergeRecipe(, .getRecipes(, .watchRecipes( literally. Covers: stores and returns unchanged; merging the same copy twice changes nothing; two members importing the same recipeId give one record with the earlier createdAt; a delete wins and a later deleted:null copy does not undo it (R20); kitchens don't mix; a watcher sees current state then a change; unsubscribe stops calls.
- packages/ports/src/sync-store/fake.test.ts: calls syncStoreRecipeContract alongside the existing item/meal contracts.
- packages/ports/src/test-support.ts: re-exports syncStoreRecipeContract.

Proof - `mise exec -- pnpm exec vitest run --project unit packages/ports`:
```
 Test Files  7 passed (7)
      Tests  71 passed (71)
```
The 7 new recipe-contract cases, verbose:
```
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > stores a merged recipe and returns it unchanged
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > merging the same copy of a recipe twice changes nothing
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > two members importing the same recipeId give one record with the earlier createdAt
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > a delete wins, and a later deleted:null copy does not undo it (R20)
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > does not mix the recipes of two kitchens
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > tells a watcher the current recipes, then every change
 ✓ |unit| packages/ports/src/sync-store/fake.test.ts > SyncStore recipe contract > stops telling a watcher of recipes after it unsubscribes
```

Per the task's instructions, repo-wide typecheck was not run (expected red until Group A finishes); only packages/ports unit tests were run. No commit was made; the worktree is handed to the next Group A builder (TASK-74.7.5/.6/.7).

Additional proof (advisor follow-up):

1. Tightened the delete-wins test: the third merge now uses a later createdAt (300, same addedBy) so it literally matches AC#3's "a later deleted:null copy" wording (a re-import), not just a same-createdAt copy. Re-ran unit tests, still 71 passed.

2. Repo-wide typecheck (`mise exec -- pnpm -s typecheck`) - zero errors under packages/ports. Every remaining error lands exactly on the break surface the contract names in §0.7: MemorySyncStore, FirestoreSyncStore, the three `: SyncStore = {` literals in add-item.scenario.test.ts (lines 54, 91, 166), and their direct consequences (compose-firebase.ts, compose-demo.ts, memory-sync-store.test.ts, firestore-sync-store.emulator.test.ts constructing/using those same two classes). No error outside that surface.

3. `node tools/checks/run.ts --mode files packages/ports/src/sync-store/port.ts packages/ports/src/sync-store/fake.ts packages/ports/src/sync-store/contract.ts packages/ports/src/sync-store/fake.test.ts` -> "checks passed (16 checks, files mode, ...)" - includes port-contracts/method-covered, confirming port.ts's three new methods are each literally called in contract.ts.
<!-- SECTION:NOTES:END -->
