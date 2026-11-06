---
id: TASK-61
title: Small UI defects from the device sweep
status: To Do
assignee: []
created_date: '2026-11-06 19:50'
labels:
  - size-2
  - app
  - ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep of release builds (fold emulator, iPhone 18 Pro simulator). Each is minor; together they make the app feel unfinished.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With the keyboard open, the first tap on Add (quick add) or Paste adds or pastes instead of only closing the keyboard
- [ ] #2 The join screen's error message wraps inside the screen; it currently runs off the right edge
- [ ] #3 Checking an invite code shows progress text, not just a spinner, while the cold-start call runs (5 to 30 s observed)
- [ ] #4 The edit-meal date pill shows the whole label (it clips to 'Thursday, Nov' on Android)
- [ ] #5 Copy diagnostics confirms the copy in the app (iOS shows no system feedback)
- [ ] #6 Settings' back link names the screen it returns to (it says Groceries when opened from Meal plan)
<!-- AC:END -->
