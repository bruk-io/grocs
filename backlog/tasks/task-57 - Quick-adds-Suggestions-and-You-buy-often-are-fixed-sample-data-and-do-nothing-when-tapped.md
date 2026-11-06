---
id: TASK-57
title: >-
  Quick add's Suggestions and You buy often are fixed sample data and do nothing
  when tapped
status: To Do
assignee: []
created_date: '2026-11-06 19:50'
labels:
  - size-2
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep. QuickAddScreen passes suggestions and oftenBought from src/sample/sample-data.ts, so every user sees Eggs, Egg noodles, Eggplant and Bananas, Limes, ... whatever they type or buy, and it passes neither onAddSuggestion nor onAddFrequent to ItemPickerTemplate, so tapping one does nothing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Quick add shows no sample-data items in a real build
- [ ] #2 Every suggestion or frequent item it does show adds that item when tapped
<!-- AC:END -->
