---
id: TASK-74.5.14
title: Recipe route shows a meal's saved recipe without calling the server
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 02:59'
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
1. Merge local main (brings the TASK-74 recipe-import wave) into this worktree's HEAD (TASK-78/79 email-invite work); resolve conflicts as unions, dropping main's invite-code functions that TASK-78 already superseded, and fix the one fixture (get-invite-offers.test.ts) that predates Deps.recipeImporter.
2. Write RecipeScreen.tsx: watches the meal (watchWeekMeals) and the kitchen's recipes (watchKitchenRecipes), finds the match with core's recipeForLink, renders RecipeTemplate, or a plain empty state when there is no match. Never dispatches ImportRecipe.
3. Add app/recipe.tsx (KitchenGate + RecipeScreen) and navigate.ts's go.recipe(dayId, mealId).
4. Add 'recipe' to the ROUTES maps in screens.route.test.tsx and meal-plan.route.test.tsx.
5. Write recipe.route.test.tsx: seeds a meal linked to a recipe's sourceUrl, renders the route, asserts the title/ingredients/steps and that appOnFakes's FakeRecipeImporter.calls stays empty; a second case covers a meal with no matching recipe.

### Risks
Follow TASK-74's slice contract (§17) exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation). The merge conflicts touch files outside apps/** (packages/ports, providers-memory, providers-server, apps/functions, packages/application) - resolved as faithful unions/completions of the two branches' own history, not new design, and called out in the merge commit and these notes.

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: apps/mobile/app/recipe.tsx, apps/mobile/src/screens/RecipeScreen.tsx, navigate.ts go.recipe, ROUTES map entries in screens.route.test.tsx and meal-plan.route.test.tsx, apps/mobile/src/routes/recipe.route.test.tsx.

Merge note: this worktree base (origin main via TASK-78/79, email invites) and local main (TASK-74 recipe-import wave, closing at 4bdaa71) diverged before TASK-78; local main never absorbed PR #32. Merging main brought conflicts in apps/functions/src/index.ts, apps/mobile/src/composition/compose-app.ts, packages/ports|providers-memory|providers-server/src/index.ts, firebase/firestore.rules.test.ts, doc-1, and two modify/delete application query test files. Resolved by keeping HEAD email-invite system (inviteByEmail/cancelInvite/invitesFor/acceptInvite) and dropping main superseded invite-code functions (joinKitchen, inviteForKitchen, previewInvite, the inviteCodes/code rules test), while bringing forward every one of main recipe-import additions (RecipeImporter port/fakes/providers, watchKitchenRecipes, the importRecipe callable, kitchens/k/recipes rules). get-invite-offers.test.ts Deps fixture (predates Deps.recipeImporter) got a FakeRecipeImporter, matching its sibling tests. Committed separately from the feature commit.

AC1: apps/mobile/app/recipe.tsx and src/screens/RecipeScreen.tsx exist; navigate.ts useGo().recipe(dayId, mealId) added.

AC2: recipe added to both ROUTES maps (screens.route.test.tsx, meal-plan.route.test.tsx), both files still pass.

AC3: apps/mobile/src/routes/recipe.route.test.tsx two cases: a meal linked to a seeded recipe shows its title, ingredient lines and numbered steps, and asserts app.recipeImporter.calls (the FakeRecipeImporter appOnFakes returns) is empty; a meal with no matching recipe shows "No recipe is saved for this meal yet." with calls also empty. vitest run project app recipe.route.test.tsx result: Test Files 1 passed, Tests 2 passed.

AC4: typecheck result: tsc noEmit, no errors, repo-wide (tsconfig.json includes apps, packages, tools, firebase). vitest run project app project tools apps result: Test Files 19 passed, Tests 116 passed (114 baseline after the merge plus 2 new). pnpm check result: checks passed 16 checks all mode.
<!-- SECTION:NOTES:END -->
