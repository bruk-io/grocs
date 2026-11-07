---
id: TASK-74.5.15
title: Meal form imports a pasted recipe link and adds its groceries
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-74.5.14
  - TASK-74.5.7
  - TASK-74.5.13
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §0.1 and §17's AddMealScreen flow, which is fixed. A blank name is refused. A new meal is saved with AddMeal first, its mealId is kept in screen state, and the screen edits that meal from then on. An existing meal is saved with EditMeal first. ImportRecipe follows. On ok, the link field becomes event.sourceUrl, the AddItems are dispatched, and the screen goes to the recipe route. Without this, a later Save would write the raw pasted link back and detach the recipe, and a retry would create a second meal. There is no Maestro flow: a real import fetches a live site, so it is checked manually (orch-proof-app). Covers TASK-74.5 AC#1, #2 and #3, and TASK-74 AC#1, #3 and #6.

Split key: app-import-flow. Layer: app. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Route test on fakes: typing a name and a link with tracking parameters, then choosing import, leaves the store holding the recipe, the meal's link equal to the normalised sourceUrl, one item per ingredient on the meal's week with the meal's badge and decision-16's name and amount, and the screen on the recipe route
- [ ] #2 Route test: after an import on an existing meal, going back and tapping Save keeps meal.link === recipe.sourceUrl, and 'View recipe' still shows
- [ ] #3 Route test: a failed import on a new meal, then a successful retry, leaves exactly one meal
- [ ] #4 A route test for each RecipeImportError and for recipe-deleted shows its message from §17's table, and the store holds no recipe, no new items and no link change from the import
- [ ] #5 A blank name shows the empty-name message and makes no importer call. A meal whose link matches a saved recipe shows 'View recipe' and navigates to it with no importer call
- [ ] #6 An AddItem failure stops the loop and shows the 'other' message, recorded as known behaviour in the task notes. At this commit, pnpm -s typecheck passes repo-wide and vitest --project app passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the created-meal state and the error map.
2. Write the import handler in §17's order, then the fan-out loop.
3. Wire the recipe title and 'View recipe'.
4. Write the route tests.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- apps/mobile/src/screens/AddMealScreen.tsx
- apps/mobile/src/routes/meal-plan.route.test.tsx
- apps/mobile/src/routes/recipe-import.route.test.tsx
<!-- SECTION:PLAN:END -->
