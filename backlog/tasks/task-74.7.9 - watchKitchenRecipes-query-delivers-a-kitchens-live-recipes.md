---
id: TASK-74.7.9
title: watchKitchenRecipes query delivers a kitchen's live recipes
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-74.7.8
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §8 (the query). It takes the SyncStore directly, so it does not widen Deps and commits on its own once Group A has landed. The app uses it in Group B. Covers TASK-74.5 AC#4 (a read path that never calls the importer) and TASK-74.7 AC#3 (consumers).

Split key: application-recipe-query. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 queries/watch-kitchen-recipes.ts exports watchKitchenRecipes(store, kitchenId, onRecipes, onError?) as in contract §8
- [ ] #2 watch-kitchen-recipes.test.ts: it delivers live recipes only, hides tombstones, passes errors to onError, and its unsubscribe stops calls
- [ ] #3 Exported from src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/application passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the test against InMemorySyncStore, then the query, then the export.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/application/src/queries/watch-kitchen-recipes.ts
- packages/application/src/queries/watch-kitchen-recipes.test.ts
- packages/application/src/index.ts
<!-- SECTION:PLAN:END -->
