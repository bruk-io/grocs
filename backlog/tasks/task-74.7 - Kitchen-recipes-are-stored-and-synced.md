---
id: TASK-74.7
title: Kitchen recipes are stored and synced
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 01:09'
updated_date: '2026-11-07 05:34'
labels:
  - size-3
  - core
dependencies:
  - TASK-74.2
  - TASK-74.3
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-16 makes an imported recipe a kitchen-wide record at kitchens/{kitchenId}/recipes/{recipeId}, found from a meal by its link. This is the storage and sync half, split out of TASK-74.5 so that task covers only the import flow and screens.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 recipe-doc.ts defines RECIPE_SCHEMA_VERSION 1 with encode and decode, and its personal fields (title, sourceUrl, ingredient lines and items, steps) are redacted from logs (R36)
- [x] #2 recipe-merge.ts merges two copies of a recipe keeping the earlier createdAt, a delete always wins, and property tests show order and repetition don't change the result
- [x] #3 SyncStore has mergeRecipe, getRecipes and watchRecipes, covered by its contract suite and implemented by the fake, the Firestore provider and the memory provider
- [x] #4 firestore.rules tests show a member can read and write their kitchen's recipes and a non-member cannot
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Group A deviation from decision-3 (orchestrator, 2026-11-07): the SyncStore widening (TASK-74.7.4 ports, 74.7.5 and 74.7.6 providers, 74.7.7 application) breaks every implementation at once, and pre-commit runs repo-wide typecheck, so no single layer builder could commit green. The four builders edited one shared worktree (.claude/worktrees/group-a) in sequence without committing, each reviewed by its own layer reviewer, and the orchestrator committed the group once everything was green (6bcb2fc, merged in 6242c0b) under TASK-74.7.8. Bruk agreed to this on 2026-11-07. Precedent: c4db885 (TASK-1.21.2/.3/.4).

Reviewed by philosophy:reviewer on main at b661b6e. Closed: all four criteria met. #1 recipe-doc.ts has RECIPE_SCHEMA_VERSION=1 with encode/decode; personal.ts marks recipe title, sourceUrl, ingredients, steps (and image) personal, tested in personal.test.ts. #2 recipe-merge.ts with fast-check property tests (recipe-merge.test.ts). #3 port.ts has mergeRecipe/getRecipes/watchRecipes; syncStoreRecipeContract runs against the fake, MemorySyncStore and FirestoreSyncStore (emulator suite 148 passed per orchestrator). #4 firestore.rules.test.ts 'kitchens/{k}/recipes' shows member read/write succeed, non-member fail. Unit re-run here: 4 files, 67 tests passed. All 9 leaves Done. Group A decision-3 deviation is recorded and approved by Bruk; no finding. No drafts filed.
<!-- SECTION:NOTES:END -->
