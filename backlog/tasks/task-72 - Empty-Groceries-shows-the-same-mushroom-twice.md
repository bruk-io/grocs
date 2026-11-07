---
id: TASK-72
title: Empty Groceries shows the same mushroom twice
status: To Do
assignee: []
created_date: '2026-11-07 00:25'
labels:
  - size-1
  - ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Spotted by Bruk 2026-11-06 on the dev build: with nothing on the list, Groceries draws Cremi beside the title (MainHeader's mascot, passed by GroceriesScreen) and again on the empty card (EmptyList hardcodes name="cremi"). Two identical mushrooms stacked. Likely fix: GroceryListTemplate leaves the header mascot out while EmptyList is showing, so the card's mushroom takes over; or the empty card picks a different one. Changes visual baselines (regenerate via the visual-baselines workflow and review).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The empty Groceries screen shows one mushroom
<!-- AC:END -->
