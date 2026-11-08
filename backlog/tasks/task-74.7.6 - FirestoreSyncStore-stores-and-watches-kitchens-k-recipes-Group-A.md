---
id: TASK-74.7.6
title: 'FirestoreSyncStore stores and watches kitchens/{k}/recipes - Group A'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:19'
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
- [x] #1 FirestoreSyncStore implements the three methods at kitchens/{k}/recipes/{id}, using decodeRecipe, mergeRecipe and encodeRecipe
- [x] #2 firestore-sync-store.emulator.test.ts also runs syncStoreRecipeContract
- [x] #3 Stored-shape tests: readRaw shows schemaVersion 1 and plain content fields; a bad or future-version doc written with writeRaw makes getRecipes reject; the watcher reports the invalid doc and still delivers valid ones
- [x] #4 The offline note in the class doc also covers recipes, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add mergeRecipe/getRecipes/watchRecipes to FirestoreSyncStore, mirroring the existing mergeMeal/getMeals/watchMeals pattern: transaction with decodeRecipe/mergeRecipe/encodeRecipe for writes, a no-where-clause collection query and a decodeAllRecipes helper for reads/watches.
2. Update the class doc comment to mention recipes alongside items and meals (AC#4).
3. Wire syncStoreRecipeContract into firestore-sync-store.emulator.test.ts (AC#2), and add stored-shape tests: readRaw shows schemaVersion 1 and plain content fields, a bad/future-version doc via writeRaw makes getRecipes reject, and the watcher reports the invalid doc while still delivering the valid one (AC#3).

### Risks
Follow TASK-74's slice contract (§15) exactly; a needed contract change goes in this task's notes and work stops (decision-3 mediation). No contract change was needed: ports (TASK-74.7.4) and core (decodeRecipe/encodeRecipe/mergeRecipe) were already in the shared worktree.

### Proof
Each acceptance criterion is shown by the vitest run below (emulator suite itself is run by orch-emulator-suite, not this builder) and by typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: packages/providers-firebase/src/firestore-sync-store.ts gains mergeRecipe/getRecipes/watchRecipes at kitchens/{k}/recipes/{id}, using decodeRecipe/mergeRecipe/encodeRecipe in a transaction for writes and a no-where-clause collection query + decodeAllRecipes helper for getRecipes/watchRecipes (AC#1). The class doc comment now covers items, meals and recipes, including the offline-transaction note (AC#4). No commit made (Group A integration, orchestrator commits).

packages/providers-firebase/src/firestore-sync-store.emulator.test.ts now also runs syncStoreRecipeContract (AC#2) and adds a 'Firestore sync store: recipe stored shape' describe block: writes schemaVersion 1 + plain content fields, a bad/future-version doc via writeRaw makes getRecipes reject, and the watcher reports the invalid doc while still delivering the valid one (AC#3). Per task description, builders cannot run emulator tests; orch-emulator-suite runs this file.

Checks run (this layer only, per task scope):
$ mise exec -- pnpm exec vitest run --project unit packages/providers-
 Test Files  15 passed (15)
      Tests  265 passed (265)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors; repo-wide typecheck is clean at this point in the group)

Files changed: packages/providers-firebase/src/firestore-sync-store.ts, packages/providers-firebase/src/firestore-sync-store.emulator.test.ts.

Closed by reviewer. AC#1: mergeRecipe/getRecipes/watchRecipes at kitchens/{k}/recipes/{id} using decodeRecipe/mergeRecipe/encodeRecipe in a transaction, no-where-clause query (6bcb2fc). AC#2: syncStoreRecipeContract wired into firestore-sync-store.emulator.test.ts. AC#3: recipe stored-shape block covers schemaVersion 1 + plain fields, bad and future-version docs rejecting getRecipes, watcher reporting invalid doc while delivering valid; passing among the orchestrator's 128 emulator tests on main. AC#4: class doc covers recipes incl. offline-transaction note; builder made no commit (orchestrator committed Group A as TASK-74.7.8). Findings: none blocking. Low: future-version test matches /unsupported|schemaVersion/ loosely rather than naming the doc; acceptable, no draft filed. Emulator suite not re-run by reviewer per orchestrator instruction (port collisions).
<!-- SECTION:NOTES:END -->
