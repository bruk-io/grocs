---
id: TASK-73
title: On iOS the keyboard covers a form's action button
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 00:38'
updated_date: '2026-11-07 14:09'
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

Reviewed by philosophy:reviewer: not closed. AC #1 is met on the evidence (shot 3-keyboard-up shows Add to Monday above the keyboard; Maestro first tap added the meal). close-task refuses: a bug closes with its repro recorded (record-check <id> --repro -- <test>, which must fail, so it has to be recorded against the pre-fix code by the worker), or a note starting 'No repro:'. The worker's note explains why there is no jsdom test; it needs to be stated as a 'No repro:' note.

Repro at b5b8e45828b1, test files: apps/mobile/e2e/meal-form-keyboard.yaml; command: `maestro --device 9EB5207C-C6E9-4EF9-807C-D5519575A9DB test -e RUN_ID=pre2 apps/mobile/e2e/meal-form-keyboard.yaml` exited 1

(7 earlier lines omitted)
```text
  Assert that "Continue with Google" is visible... COMPLETED
  Open grocs://dev-sign-in?as=${ACCOUNT}... COMPLETED
  Assert that "Groceries|Your kitchen" is visible... COMPLETED
Run subflows/sign-in.yaml... COMPLETED
Tap on "Meal plan"... COMPLETED
Assert that "Next week" is visible... COMPLETED
Repeat while "Plan a meal" is not visible (up to 8 times)...
  Tap on "Next week"... COMPLETED
Repeat while "Plan a meal" is not visible (up to 8 times)... COMPLETED
Tap on "Plan a meal", Index: 0... COMPLETED
Assert that "Add a meal" is visible... COMPLETED
Tap on "What are you making?"... COMPLETED
Input text ${MEAL}... COMPLETED
Wait for animation to end... COMPLETED
Take screenshot meal-form-keyboard-open... COMPLETED
Tap on "Add to .*"... COMPLETED
Assert that "This week|Week of.*" is visible... FAILED

Assertion is false: "This week|Week of.*" is visible

Assertion '"This week|Week of.*" is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.

Possible causes:
- Element selector may be incorrect - check if there are similar elements with slightly different names/properties.
- Element may be temporarily unavailable due to loading state
- This could be a real regression that needs to be addressed

==== Debug output (logs & screenshots) ====

/Users/brukhabtu/.maestro/tests/2026-11-07_090220
```

Repro recorded above: apps/mobile/e2e/meal-form-keyboard.yaml (type a meal, then one tap on 'Add to <day>' with the keyboard up) against the pre-fix TaskLayout with Metro restarted: the button sat under the keyboard and the flow failed (screenshot /Users/brukhabtu/.maestro/tests/2026-11-07_090220/meal-form-keyboard/takeScreenshot/meal-form-keyboard-open.png). With the fix and Metro restarted: passed, button above the keyboard (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/post/2026-11-07_090746/meal-form-keyboard/takeScreenshot/meal-form-keyboard-open.png). An earlier 'pre-fix' attempt passed only because Metro had not reloaded the reverted file; that run is not evidence.
<!-- SECTION:NOTES:END -->
