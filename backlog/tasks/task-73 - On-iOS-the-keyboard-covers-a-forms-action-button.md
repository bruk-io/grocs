---
id: TASK-73
title: On iOS the keyboard covers a form's action button
status: To Do
assignee: []
created_date: '2026-11-07 00:38'
labels:
  - size-1
  - ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-70 device run, 2026-11-06 (screenshot: Add a meal with the keyboard up). TaskLayout pins the action bar (Add to Monday, Check code, Start planning) to the bottom outside the ScrollView, with no keyboard avoidance, so on iOS the keyboard covers it while typing; tapping the header does not dismiss the keyboard either, since the header is outside the ScrollView too. The return key submits these forms, so nobody is stuck, but the visible button is hidden exactly when it is wanted. Likely fix: KeyboardAvoidingView (or keyboard-aware insets) in TaskLayout so the action bar rides above the keyboard. Related: TASK-61's first-tap item.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With the keyboard open on iOS, a task screen's action button is visible and works on the first tap
<!-- AC:END -->
