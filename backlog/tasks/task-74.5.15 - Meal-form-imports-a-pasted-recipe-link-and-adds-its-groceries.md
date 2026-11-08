---
id: TASK-74.5.15
title: Meal form imports a pasted recipe link and adds its groceries
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 03:48'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-74.5.14
  - TASK-74.5.7
  - TASK-74.5.13
  - TASK-74.5.17
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
1. AddMealScreen: add `createdMealId` state (the AC#3/§17 step 2 rule: once a new meal is created the screen edits that meal from then on, never creating a second one), a `recipes` state fed by `app.watchKitchenRecipes`, an `importing`/`importError` pair, and the §17 error-code -> message table (plus 'other' default covering 'not-signed-in'/'meal-not-found'/'internal'/AddItem failure).
2. Write `handleImport` in §17's literal order: blank name -> existing empty-name message, no dispatch; AddMeal (new meal, keep `createdMealId`) or EditMeal (existing/already-created meal) with current name+link; dispatch ImportRecipe; on err show the table message under the link field and stop; on ok set the link field to `event.sourceUrl`, fan out one AddItem per groceries line (amount omitted when null, mealId/weekId from the event), stopping on the first AddItem failure with the 'other' message (AC#6, known behaviour, noted); otherwise `go.recipe(dayId, event.mealId)`.
3. Wire `recipeTitle`/`onOpenRecipe`: `recipeForLink(recipes, link)` against the live link field; shown only when a concrete meal id exists (mealId prop or createdMealId) so "View recipe" never fires with nowhere to navigate; tapping navigates with no importer call (AC#5).
4. New `apps/mobile/src/routes/recipe-import.route.test.tsx` covering AC#1-#6 on fakes (FakeRecipeImporter, InMemorySyncStore) through the real add-meal/plan/recipe routes; touch `meal-plan.route.test.tsx` only if an existing case needs the recipe route wired in for an assertion.

### Risks
Follow TASK-74's slice contract exactly (§17, §0's cross-layer decisions 1/2/6); a needed contract change goes in this task's notes and the work stops (decision-3 mediation). AddMeal/EditMeal failing inside the import flow itself (e.g. an invalid-link format) is not in an AC; it is handled by reusing the existing `problemFor` banner and stopping before ImportRecipe, which is the minimal consistent behaviour and is called out in the notes rather than invented as new contract.

### Proof
Each acceptance criterion is shown by a route test in recipe-import.route.test.tsx (or meal-plan.route.test.tsx) and by `pnpm -s typecheck` / `vitest --project app` output recorded in the notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation (builder-app)

AddMealScreen (apps/mobile/src/screens/AddMealScreen.tsx) now wires MealFormTemplate's import
affordance to the contract's §17 flow:
- watchKitchenRecipes feeds a `recipes` state; recipeForLink(recipes, link) + an `activeMealId`
  (mealId prop, or a `createdMealId` set once this screen itself creates a new meal) drive "View
  recipe" (shown only once a concrete meal id exists) with no importer call on open or View.
- `importRecipe()`: blank name -> existing empty-name banner, no dispatch; AddMeal (new meal, keeps
  createdMealId) or EditMeal (existing/already-created meal) with the current name+link; then
  ImportRecipe; on err, the §17 error-code table (RECIPE_IMPORT_MESSAGES, 'other' default covers
  not-signed-in/meal-not-found/internal and an AddItem failure) under the link field, nothing
  further changed; on ok, link field set to event.sourceUrl, one AddItem per groceries line in
  order (amount omitted when null, mealId/weekId from the event), stopping on the first AddItem
  failure with the 'other' message (AC#6, known behaviour - the groceries already added and the
  recipe/relink stay, only the fan-out stops); otherwise go.recipe(dayId, event.mealId).
- `submit()` (plain Save/Add) also uses `activeMealId`, so a retry or a later Save never creates a
  second meal (part of AC#3's guarantee).

New apps/mobile/src/routes/recipe-import.route.test.tsx (13 tests, all through the real
add-meal/plan/recipe routes on fakes) covers every AC:
- AC#1: a link with tracking parameters imports, the store holds the recipe and the meal's link
  equals the normalised sourceUrl, one item per ingredient with the meal's badge and
  decision-16's name/amount, screen on the recipe route.
- AC#2: after import on an existing meal, a fresh mount of the same route (simulating "back") still
  shows the recipe's link and View recipe; Save keeps meal.link === recipe.sourceUrl.
- AC#3: a failed import (unseeded URL) then a successful retry (good URL) leaves exactly one meal.
- AC#4: it.each over all 6 RecipeImportError codes plus recipe-deleted (via a pre-seeded tombstone
  for the deterministic recipeId, decision-3 §0.6) - each shows its §17 message, leaves no recipe,
  no items, and the link unchanged by the import itself (the EditMeal ahead of it already set the
  typed link, per §17 step 3).
- AC#5: a blank name shows the empty-name message with zero importer calls; a meal whose link
  matches a saved recipe shows View recipe and navigates with zero importer calls.
- AC#6: a crafted blank-line ingredient makes the second AddItem fail; the loop stops, the 'other'
  message shows, and only the first item was added (recorded above as known behaviour per §17
  step 6, matching the task description).

Found and worked around in the tests (not an app-code bug): AddMeal/EditMeal and ImportRecipe both
write the same meal's link field within one test tick; FakeClock never advances on its own, so two
dispatches in the same tick get an identical stamp and R18's LWW tie-break (favouring the
JSON-larger value) could keep the pre-import, not post-import, link. Added a tiny TickingClock
(FakeClock subclass that advances by 1ms per `now()` call) in the test file only, matching how a
real clock always moves between two dispatches.

## Proof

`pnpm -s typecheck` (repo-wide): passes, no errors.

`vitest --project app` (apps/mobile/src/routes/recipe-import.route.test.tsx): 13/13 passed, naming
every AC in its title (see test titles for the AC# mapping).

`vitest --project app` (whole project, regression check): 14 test files, 110 tests, all passed.

`vitest --project tools`: 29 test files, 321 tests, all passed (no layer-boundary or test-presence
violations from the new file/changes).

Files changed: apps/mobile/src/screens/AddMealScreen.tsx (edited),
apps/mobile/src/routes/recipe-import.route.test.tsx (new). meal-plan.route.test.tsx was not
touched - its existing EditMeal/AddMeal/RemoveMeal cases needed no change, and every new scenario
fit the new file.
<!-- SECTION:NOTES:END -->
