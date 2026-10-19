---
id: DRAFT-6
title: Signed-in home is the Groceries template fed by the live list
status: Draft
assignee: []
created_date: '2026-10-19 09:27'
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
<!-- AC:END -->
