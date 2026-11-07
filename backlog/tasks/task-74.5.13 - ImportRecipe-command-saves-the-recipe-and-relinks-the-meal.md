---
id: TASK-74.5.13
title: ImportRecipe command saves the recipe and relinks the meal
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-3
  - layer-application
dependencies:
  - TASK-74.5.12
  - TASK-74.5.2
  - TASK-74.7.3
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §8, §0.1, §0.2 and §0.6. ImportRecipe imports through the port, refuses a tombstoned recipe, relinks the meal before storing anything, saves the kitchen recipe and the meal, and returns RecipeImported with sourceUrl and grocery lines. The screen dispatches the AddItems. It lands after Group B, because Deps.recipeImporter cannot be required earlier (a recorded deviation). Covers TASK-74.5 AC#1 (save), AC#3 (errors save nothing), TASK-74 AC#14 (R36) and R47.

Split key: application-import-recipe. Layer: application. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 commands/import-recipe.ts follows contract §8's seven steps in order, is registered in commands/index.ts, and its types are exported from src/index.ts
- [ ] #2 import-recipe.scenario.test.ts covers: the happy path (an event with recipeId, mealId, weekId, sourceUrl and one grocery line per ingredient; the store holds the recipe; the meal link equals sourceUrl); each RecipeImportError gives err with that code and stores no recipe and no meal change; recipe-deleted (seed a tombstone with the same id; nothing stored, meal not relinked); relinkMeal failing (a stub importer returning sourceUrl 'ftp://x') gives 'internal' and stores nothing; not-signed-in; meal-not-found without calling the importer; a throwing importer becomes 'internal' with an error log; the call goes through the instrumented port {port:'recipeImporter', method:'importRecipe'}; R36 (no title, URL, ingredient or step text in JSON.stringify(logger.records()))
- [ ] #3 R47 two-member cases, using add-item.scenario's offline-store pattern: (1) two clients importing the same URL give one recipe with the earlier createdAt; (2) B relinks the meal offline with an earlier stamp and syncs after A's import, and the meal keeps sourceUrl; with a later stamp B's link wins and recipeForLink returns null for that meal while the recipe stays; (3) B removes the meal while A imports, and after merge the meal stays deleted (R20) while the kitchen recipe exists
- [ ] #4 At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/application passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the scenario tests, modelled on create-kitchen and add-item.
2. Write the handler, then register it.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/application/src/commands/import-recipe.ts
- packages/application/src/commands/import-recipe.scenario.test.ts
- packages/application/src/commands/index.ts
- packages/application/src/index.ts
<!-- SECTION:PLAN:END -->
