---
id: TASK-74.7.7
title: add-item scenario's hand-built SyncStores gain the recipe methods - Group A
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:19'
labels:
  - size-1
  - layer-application
dependencies:
  - TASK-74.7.4
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Group A member. The three object literals annotated `: SyncStore` in add-item.scenario.test.ts (lines 54, 91 and 166) stop compiling once SyncStore declares the recipe methods. This task edits the shared worktree only and does NOT commit. orch-integrate-sync-store commits. Covers TASK-74.7 AC#3 (consumers compile).

Split key: application-sync-literals. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The three SyncStore literals in add-item.scenario.test.ts declare mergeRecipe, getRecipes and watchRecipes, and every existing assertion is unchanged
- [x] #2 vitest --project unit packages/application passes in the shared worktree, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Open packages/application/src/commands/add-item.scenario.test.ts in the shared worktree named in the task notes.
2. In the literal `const broken: SyncStore = {` near line 54, after the line `watchMeals: () => () => undefined,`, add three lines: `mergeRecipe: () => Promise.reject(new Error('store is down')),` then `getRecipes: () => Promise.resolve([]),` then `watchRecipes: () => () => undefined,`.
3. In the literal `const offlineStore: SyncStore = {` near line 91, after the line `watchMeals: (k, w, cb, onError) => shared.watchMeals(k, w, cb, onError),`, add three lines: `mergeRecipe: (k, recipe) => shared.mergeRecipe(k, recipe),` then `getRecipes: (k) => shared.getRecipes(k),` then `watchRecipes: (k, cb, onError) => shared.watchRecipes(k, cb, onError),`.
4. In the literal `const broken: SyncStore = {` near line 166, after its `watchMeals: () => () => undefined,` line, add three lines: `mergeRecipe: () => Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' })),` then `getRecipes: () => Promise.resolve([]),` then `watchRecipes: () => () => undefined,`.
5. Change nothing else in the file. Do not remove or skip any test.
6. Run `mise exec -- pnpm exec vitest run --project unit packages/application`. If it fails for a reason other than a missing recipe method, stop and report in the task notes.
7. Do not commit. Write 'Group A application literals done' in the task notes.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/application/src/commands/add-item.scenario.test.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Complete

Added recipe methods (mergeRecipe, getRecipes, watchRecipes) to all three hand-built SyncStore literals in add-item.scenario.test.ts:

1. Line 54 (broken store): Added methods with rejecting implementations
2. Line 91 (offlineStore): Added methods delegating to shared store  
3. Line 166 (second broken store): Added methods with unavailable error responses

### Test Results
All acceptance criteria met:
- AC#1: All three SyncStore literals now declare mergeRecipe, getRecipes and watchRecipes methods
- AC#2: vitest --project unit packages/application passes with 17 test files, 94 tests passing

```
Test Files  17 passed (17)
Tests  94 passed (94)
Duration  347ms (transform 2.18s, setup 0ms, import 3.13s, tests 129ms, environment 1ms)
```

Group A application literals done. No commit made as per task instructions.

Reviewed by philosophy:reviewer. Closed. AC1: git show 6bcb2fc on add-item.scenario.test.ts is additions only - mergeRecipe/getRecipes/watchRecipes added to the three SyncStore literals exactly as planned; no assertion touched. AC2: vitest --project unit packages/application on main re-run by reviewer: 17 files, 94 tests passed; builder made no commit (group committed by orchestrator in 6bcb2fc under TASK-74.7.8, agreed deviation). No findings.
<!-- SECTION:NOTES:END -->
