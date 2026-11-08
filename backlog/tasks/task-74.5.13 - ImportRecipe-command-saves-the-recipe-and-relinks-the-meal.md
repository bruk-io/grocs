---
id: TASK-74.5.13
title: ImportRecipe command saves the recipe and relinks the meal
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 03:01'
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
1. Merged main into this worktree first (resolved 9 conflicts between origin/main's TASK-78/79 email-invite work and this branch's TASK-74 recipe wave: kept HEAD's invite-code deletions, took main's recipe additions; dropped two resurrected invite-code query tests; widened get-invite-offers.test.ts's Deps with recipeImporter, the one spot Group B's sweep had not reached since that test postdates it). Committed separately from this task's work, then merged again to pick up main's further advance (TASK-74.5.8/.10/.11/.12 closed).
2. Write packages/application/src/commands/import-recipe.ts implementing contract TASK-74 §8's seven steps in order (not-signed-in, meal lookup before calling the importer, importRecipe call, recipe-deleted tombstone check via syncStore.getRecipes + isRecipeDeleted, relinkMeal with the normalised sourceUrl, mergeRecipe then mergeMeal, RecipeImported event with groceries from core groceryLineFor).
3. Write import-recipe.scenario.test.ts modelled on add-item.scenario.test.ts (offline-store two-client pattern for R47) and edit-meal/add-meal (meal lookup, stamp) and invite-by-email.scenario.test.ts (instrumented-port assertion, R36 text check): happy path, every RecipeImportError code, recipe-deleted tombstone, relinkMeal failure (ftp:// stub), not-signed-in, meal-not-found (importer not called), throwing importer -> internal with error log, instrumented-port check, R36 log-text check, and the three R47 two-member cases.
4. Register importRecipe in commands/index.ts and export importRecipe/ImportRecipe/RecipeImported from src/index.ts (watchKitchenRecipes already exported by the prior merge).
5. Run vitest --project unit packages/application and pnpm -s typecheck repo-wide; record output in the task notes.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation). The merge above was mechanical reconciliation of two already-reviewed branches, not a contract change, per the advisor's reading of CLAUDE.md's "or the orchestrator, if the agent can't resolve its own merge" line.

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation (contract TASK-74 §8, §0.1, §0.2, §0.6):
- packages/application/src/commands/import-recipe.ts: importRecipe follows the seven steps in order (not-signed-in; meal lookup before calling the importer; recipeImporter.importRecipe(url); getRecipes + isRecipeDeleted tombstone check -> 'recipe-deleted'; relinkMeal with parsed.sourceUrl, 'internal' on its (impossible-in-practice) failure; mergeRecipe then mergeMeal; RecipeImported with groceries from core groceryLineFor). Registered in commands/index.ts; importRecipe, ImportRecipe and RecipeImported exported from src/index.ts (watchKitchenRecipes was already exported by the branch this task built on).
- packages/application/src/commands/import-recipe.scenario.test.ts: 18 cases - happy path; each of the 6 RecipeImportError codes stores nothing; recipe-deleted tombstone leaves the meal unrelinked; a non-http(s) sourceUrl (ftp://x) maps to internal; not-signed-in and meal-not-found never call the importer; a throwing importer becomes internal with a logged error; the call is checked through the instrumented port {port:'recipeImporter', method:'importRecipe'}; R36 (title/URL/ingredient/step text absent from JSON.stringify(logger.records())); three R47 two-member cases (same-URL import from both clients keeps one recipe at the earlier createdAt; an offline relink merges against the import by stamp, not arrival order, in both directions, with recipeForLink confirming the detached case; a concurrent remove beats a concurrent import - meal stays deleted, recipe still saves, per R20).

Checks (AC#4):
$ mise exec -- pnpm exec vitest run --project unit packages/application
 Test Files  20 passed (20)
      Tests  116 passed (116)

$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(clean, no output - exit 0, repo-wide)

$ node tools/checks/run.ts --mode staged
checks passed (16 checks, staged mode)

Pre-merge note: this worktree's branch had diverged from local main (TASK-78/79 email-invite work landed on main after this branch's TASK-74 wave started). Per the advisor's reading of CLAUDE.md's merge-refresh guidance, I ran `git merge --no-edit main` before starting (twice, as main advanced again mid-session with the Group B close), resolving 9 mechanical conflicts (kept HEAD's invite-code deletions, took in the recipe-wave additions; dropped two invite-code query tests TASK-78 already removed; widened get-invite-offers.test.ts's Deps with FakeRecipeImporter, the one test the prior Group B sweep had not reached). Committed as a separate commit from this task's own work, both already included above in the green runs.
<!-- SECTION:NOTES:END -->
