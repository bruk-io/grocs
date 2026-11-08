---
id: TASK-77
title: The meal form's Paste button does nothing
status: To Do
assignee: []
created_date: '2026-11-07 14:09'
updated_date: '2026-11-08 17:55'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found 2026-11-07 while proving TASK-61 #1: MealFormTemplate draws Paste and calls onPasteLink, but AddMealScreen never passes onPasteLink, so the button is inert on the phones. Repro: Meal plan > Plan a meal > copy a URL > tap Paste: the link field stays empty. The app already has a clipboard write (app.copyText); reading needs a clipboard read port or expo-clipboard's getStringAsync behind one, and iOS shows its paste-permission prompt.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Paste on Add/Edit a meal puts the clipboard's text in the Recipe link field
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-08: TASK-59, the same bug from the 2026-11-06 device sweep, was archived as a duplicate of this one. That sweep saw it on both iOS and Android.
<!-- SECTION:NOTES:END -->
