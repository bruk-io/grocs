---
id: TASK-59
title: Add a meal's Paste button does nothing
status: To Do
assignee: []
created_date: '2026-11-06 19:50'
updated_date: '2026-11-08 17:55'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep, on iOS and Android. MealFormTemplate takes onPasteLink, but AddMealScreen never passes it, so Paste beside Recipe link is a dead button.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tapping Paste puts the clipboard's text into the recipe link field
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-08: duplicate of TASK-77, which has the fuller repro. Archived in favour of it.
<!-- SECTION:NOTES:END -->
