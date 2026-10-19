---
id: TASK-9
title: Signed-in home is the Groceries template fed by the live list
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 09:27'
updated_date: '2026-10-19 10:49'
labels:
  - size-3
  - layer-app
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After TASK-1.37.5 the signed-in / route still renders the skeleton's ListScreen, and /groceries shows GroceryListTemplate with sample data only, so Groceries, Plan and Settings are not reachable from the signed-in app. The template needs sections, meal badges and who-added that the skeleton's Item model lacks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Signed in, / leads to Groceries rendering GroceryListTemplate from live items, with the tabs reaching Plan and Settings
- [ ] #2 The skeleton's add-item flow and two-client test pass through the Groceries template
- [ ] #3 The /groceries sample route and its state query parameters move to stories or a dev-only route
- [ ] #4 Route tests show the mushroom host on every screen (R40) and cover the Groceries all-done state
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026). Criterion 4 added at acceptance: the TASK-1.37.5 reviewer folded the mushroom-host and all-done route tests into this follow-up, but the draft did not list them. Scope: app layer only. Live items render without sections, meal badges or anything else the Item model does not hold yet; those fields arrive with the slices that own them (TASK-1.20 onwards), and this task does not add them to core.
<!-- SECTION:NOTES:END -->
