---
id: TASK-74.5
title: Paste a recipe link in the app and get its recipe and groceries
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-07 02:35'
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
<!-- SECTION:NOTES:END -->
