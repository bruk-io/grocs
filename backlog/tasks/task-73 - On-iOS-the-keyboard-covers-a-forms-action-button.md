---
id: TASK-73
title: On iOS the keyboard covers a form's action button
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 00:38'
updated_date: '2026-11-07 13:33'
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
- [x] #1 With the keyboard open on iOS, a task screen's action button is visible and works on the first tap
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fix (9141832): TaskLayout wraps the screen in KeyboardAvoidingView (behaviour 'padding' on iOS, none elsewhere, since Android resizes the window). Proof on the iPhone 18 Pro simulator: Add a meal with the keyboard up shows 'Add to Monday' above the keyboard (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/2026-11-07_081428/verify-alex/takeScreenshot/3-keyboard-up.png), and a Maestro tapOn 'Add to .*' with the keyboard open added the meal on the first tap. No jsdom test: react-native-web has no keyboard, so the device run is the evidence.
<!-- SECTION:NOTES:END -->
