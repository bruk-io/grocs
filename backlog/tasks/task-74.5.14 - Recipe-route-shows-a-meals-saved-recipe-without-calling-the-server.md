---
id: TASK-74.5.14
title: Recipe route shows a meal's saved recipe without calling the server
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-74.5.12
  - TASK-74.5.6
  - TASK-74.5.2
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §17. app/recipe.tsx?dayId&mealId wraps a RecipeScreen in KitchenGate. It finds the meal, then the recipe through App.watchKitchenRecipes and recipeForLink(recipes, meal.link), and renders RecipeTemplate. It never dispatches ImportRecipe. Covers TASK-74.5 AC#4 and TASK-74 AC#4.

Split key: app-recipe-view. Layer: app. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 app/recipe.tsx and src/screens/RecipeScreen.tsx exist, and navigate.ts has recipe(dayId, mealId)
- [ ] #2 The ROUTES maps in screens.route.test.tsx and meal-plan.route.test.tsx include the route
- [ ] #3 A level-4 route test seeds a recipe and a meal linked to its sourceUrl, renders the route, sees the title, ingredient lines and steps, and asserts that the FakeRecipeImporter returned by appOnFakes has empty calls. A meal with no matching recipe shows an empty state
- [ ] #4 At this commit, pnpm -s typecheck passes repo-wide and vitest --project app passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the route and screen.
2. Add the navigation entry and the ROUTES map entries.
3. Write the route test.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- apps/mobile/app/recipe.tsx
- apps/mobile/src/screens/RecipeScreen.tsx
- apps/mobile/src/screens/navigate.ts
- apps/mobile/src/routes/screens.route.test.tsx
- apps/mobile/src/routes/meal-plan.route.test.tsx
- apps/mobile/src/routes/recipe.route.test.tsx
<!-- SECTION:PLAN:END -->
