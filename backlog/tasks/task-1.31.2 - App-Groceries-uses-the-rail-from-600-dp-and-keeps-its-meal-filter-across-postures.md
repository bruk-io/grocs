---
id: TASK-1.31.2
title: >-
  App: Groceries uses the rail from 600 dp and keeps its meal filter across
  postures
status: To Do
assignee: []
created_date: '2026-10-21 15:38'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-1.31.1
parent_task_id: TASK-1.31
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R43. Builds the app half of decision-14: the width switch (600 dp and wider), the meal filter state, and the meals the rail shows (the sample week until the meal plan slice, TASK-1.21).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 At a window 600 dp or wider Groceries renders the inner layout with the rail, and below it the phone layout, proved by route tests at both widths
- [ ] #2 A chosen meal filter survives a change of width (fold and unfold) in a route test
- [ ] #3 In the demo, the sample items carry the sample meals' badges, and choosing a meal in the rail filters the list (demo route test)
- [ ] #4 On the Fold, unfolding and folding with a meal chosen keeps the filter, with screenshots in the notes
<!-- AC:END -->
