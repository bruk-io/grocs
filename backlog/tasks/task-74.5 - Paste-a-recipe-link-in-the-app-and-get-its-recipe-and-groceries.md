---
id: TASK-74.5
title: Paste a recipe link in the app and get its recipe and groceries
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-08 04:21'
labels:
  - size-5
  - app
  - finish-moved
dependencies:
  - TASK-74.2
  - TASK-74.4
  - TASK-74.7
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The app half of TASK-74. The app knows nothing about recipe sites or parsing: its import port takes a URL and returns a parsed recipe or an error, and its provider only calls the import function. Where the recipe is saved and how its ingredients become grocery Items is decided in TASK-74.2. Proven locally first, against the function in the emulator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A member can paste a recipe URL and see its title, ingredients, steps and yield saved in their kitchen
- [ ] #2 Importing adds all of the recipe's ingredients to the kitchen's grocery list as TASK-74.2 decides; the app does not combine or convert units (R12's combine prompt is not built yet, so an ingredient matching a list item is added as a separate item; follow-up TASK-1.26)
- [ ] #3 Each import error (not a recipe, page needs a login, site unreachable, not found) shows the member a message saying why, and nothing is saved
- [ ] #4 Viewing a saved recipe never calls the function or a recipe site
- [ ] #5 The app's import port has a contract test, and its provider talks only to the import function
- [ ] #6 A locally run app imports a real recipe through the function in the emulator (manual local run by the orchestrator; no automated test fetches a live site, decision-15)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
finish-moved (TASK-74.4.1, 2026-11-07): AC#2 now notes that R12's combine prompt is not built (no combine code exists in packages or apps, contract §0.1), so an imported ingredient matching a list item is added as a separate item; R12's prompt is already an open task, TASK-1.26 (found by 'backlog search "combine prompt"'), so no new draft was filed. AC#6 now says it is a manual local run by the orchestrator, because decision-15 and contract §0.4 forbid any automated test from fetching a live site.

Deleted design/reference/RecipeImport.dc.html: superseded by decision-16 (no ticking, no scaling), R66. Its shot design/reference/shots/RecipeImport.png and its canvas.json entry went with it (TASK-74.5.1).

TASK-74.5.9 (orchestrator, 2026-11-07) on main at 7fccb40: pnpm test:emulator 11 files / 148 tests passed, including recipe-importer.emulator.test.ts (FirebaseRecipeImporter through the real importRecipe callable, 5 tests) - the 4 failures expected since wave 3 are gone. No outbound host besides the local Functions emulator. pnpm check 16 passed.

Deviation (Group B, TASK-74.5.12): TASK-74.5.10 and TASK-74.5.11 were built in one shared integration worktree without committing, sequentially, and the orchestrator committed them together as 26782b0, because widening Deps breaks every construction site at once. Same deviation and reason as Group A (6bcb2fc, recorded on TASK-74 and TASK-74.7).

Local proof (TASK-74.5.16), 2026-11-07, main at 39457f7. The iOS dev build (io.bruk.grocs.dev, simulator 'iPhone 18 Pro (grocs)') ran against `pnpm emulators` (Firestore, Auth, the real importRecipe callable in the Functions emulator) with Metro serving main, driven by Maestro flows kept in the session scratchpad (proof-app/*.yaml); screenshots in proof-app/shots/.
- Alex (grocs://dev-sign-in?as=alex) planned 'Proof chili p3' on Wed with the real link https://www.budgetbytes.com/basic-chili/?utm_source=proof, saved, reopened it and chose 'Get recipe and groceries'. Metro: 'command ImportRecipe ok', then 17 x 'command AddItem ok'.
- Recipe saved and shown: the recipe route shows 'Homemade Chili Recipe', '6 servings (1 cup each)', 'From www.budgetbytes.com', ingredients and steps (screens 04, 05).
- Meal relinked: the plan shows the meal's link as https://www.budgetbytes.com/basic-chili, utm_source stripped (06).
- Groceries: '17 to go', every item carrying the 'Proof chili p3' badge (09).
- Save afterwards keeps the recipe: reopened, tapped Save, reopened again - 'Saved recipe: Homemade Chili Recipe / View recipe' still shows and opens the recipe (07, 08).
- Error case: 'Proof banana bread' with https://www.allrecipes.com/recipe/20144/banana-banana-bread/ - the callable logged {error:'blocked'} only (no URL), Metro logged 'command ImportRecipe rejected' errorCode blocked, the form shows "That site needs a login or blocked us, so we can't read it." under the link, and no AddItem followed (10).
Deviation from the plan's step 3: the first attempts imported straight from the new-meal form, and the import tap landed on 'Add to <day>' because, with the keyboard open, the raised action bar (TASK-73) covers the 'Get recipe and groceries' button; iOS hideKeyboard presses return (which submits) and tapping the heading does not close the keyboard. So the proof saves the meal with its link first and imports from the reopened meal, a path a person has. The covered button is filed as a draft bug. Also seen: grocery item names keep broken parentheses ('yellow onion (small dice' from '1 yellow onion (small dice, (about 2 cups) $0.74)'), filed as a draft.
AC#2 on main at 39457f7: pnpm check 16 passed; pnpm typecheck clean; pnpm test 157 files / 2110 tests passed; pnpm test:emulator 11 files / 144 tests passed.
<!-- SECTION:NOTES:END -->
