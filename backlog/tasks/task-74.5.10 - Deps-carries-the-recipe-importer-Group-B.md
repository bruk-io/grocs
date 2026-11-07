---
id: TASK-74.5.10
title: Deps carries the recipe importer - Group B
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-74.5.3
  - TASK-74.7.9
  - TASK-74.5.4
  - TASK-74.5.5
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §8 (Deps.recipeImporter, instrumentDeps, testing/client.ts) and §0.7. This is the first member of integration Group B. It edits a shared worktree and does NOT commit. app-compose-recipes then supplies the importer in apps/mobile, and orch-integrate-deps commits. The application construction sites that break are: testing/client.ts, dispatcher.test.ts, instrument.test.ts, remove-meal.scenario.test.ts, and the make() helpers in the six query tests (find-my-kitchen, get-invite-preview, get-kitchen-info, get-kitchen-invite, queries, watch-week-meals). Covers TASK-74.5 AC#5 (wiring) and TASK-74.7 AC#3 (consumers compile).

Split key: application-recipe-deps. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Deps has a required readonly recipeImporter: RecipeImporter, and instrumentDeps wraps it as port 'recipeImporter'. instrument.test.ts asserts the port name and that the method is 'importRecipe'
- [ ] #2 createTestClient accepts recipeImporter? (default FakeRecipeImporter) and returns it
- [ ] #3 Every application Deps construction site listed in the description supplies a FakeRecipeImporter
- [ ] #4 vitest --project unit packages/application passes in the shared worktree, and no commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Widen Deps and instrumentDeps.
2. Fix testing/client.ts, then each listed test literal.
3. Run the application tests and write the hand-off note.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/application/src/dispatch/types.ts
- packages/application/src/instrumentation/instrument.ts
- packages/application/src/instrumentation/instrument.test.ts
- packages/application/src/testing/client.ts
- packages/application/src/dispatch/dispatcher.test.ts
- packages/application/src/commands/remove-meal.scenario.test.ts
- packages/application/src/queries/find-my-kitchen.test.ts
- packages/application/src/queries/get-invite-preview.test.ts
- packages/application/src/queries/get-kitchen-info.test.ts
- packages/application/src/queries/get-kitchen-invite.test.ts
- packages/application/src/queries/queries.test.ts
- packages/application/src/queries/watch-week-meals.test.ts
<!-- SECTION:PLAN:END -->
