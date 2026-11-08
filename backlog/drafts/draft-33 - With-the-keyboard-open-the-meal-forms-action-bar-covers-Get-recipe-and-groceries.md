---
id: DRAFT-33
title: >-
  With the keyboard open, the meal form's action bar covers 'Get recipe and
  groceries'
status: Draft
assignee: []
created_date: '2026-11-08 04:21'
labels:
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen in TASK-74.5.16's proof on the iOS simulator. On Add a meal, after typing a link the keyboard stays open and the action bar ('Add to <day>'), which TASK-73 raised above the keyboard, sits exactly over the 'Get recipe and groceries' button. A tap meant for the import lands on Add and saves the meal without importing. Return submits the form and tapping elsewhere does not close the keyboard, so on a new meal the import button cannot be reached while typing. Repro: Maestro flow in the TASK-74.5 proof notes (type a name and a link, tap 'Get recipe and groceries'; Metro logs AddMeal, no ImportRecipe).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With the keyboard open after typing a link on a new meal, 'Get recipe and groceries' is visible and tappable, shown by a Maestro flow that imports from the new-meal form without saving first
- [ ] #2 The TASK-73 keyboard-open flows still pass
<!-- AC:END -->
