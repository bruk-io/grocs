---
id: TASK-61
title: Small UI defects from the device sweep
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-07 13:33'
labels:
  - size-2
  - app
  - ui
  - finish-moved
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep of release builds (fold emulator, iPhone 18 Pro simulator). Each is minor; together they make the app feel unfinished.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 With the keyboard open, the first tap on Add (quick add) or Paste adds or pastes instead of only closing the keyboard
- [x] #2 The join screen's error message wraps inside the screen; it currently runs off the right edge
- [x] #3 Checking an invite code shows progress text, not just a spinner, while the cold-start call runs (5 to 30 s observed)
- [x] #4 Copy diagnostics confirms the copy in the app (iOS shows no system feedback)
- [x] #5 Settings' back link names the screen it returns to (it says Groceries when opened from Meal plan)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
AC #4 (edit-meal date pill clipping on Android) moved to its own task TASK-76 on 2026-11-07: it needs an Android device and the Android SDK was gone from this machine, so it could not be reproduced or verified here.

Fixes (9141832): #1 TaskLayout's ScrollView has keyboardShouldPersistTaps='handled', so a tap on Add/Paste inside a task form acts while the keyboard is open; checked on the iOS simulator (quick add: typed with keyboard up, one tap on Add, item on Groceries). Not checked on Android (SDK missing); the prop is cross-platform. Paste uses the same ScrollView but was not tapped separately. #2 TextField's error text sits in a flex:1 box so it wraps: simulator screenshot /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/2026-11-07_081545/verify-pat/takeScreenshot/6-error-wrap.png and baseline templates-invite-retry--invalid. #3 InviteRetryTemplate shows 'Checking with the server. The first check can take up to half a minute.' under the button while checking; state/story Checking, behaviour test. #4 PreferencesTemplate diagnosticsCopied: the button reads '✓ Copied' after a successful copy; story Copied, behaviour test, route test asserts it after Copy diagnostics; seen on the simulator. #5 PreferencesTemplate backLabel; Plan opens Settings via go.settingsFromPlan (?from=plan), whose back link says Meal plan and returns there; route test and simulator run. Baselines from visual-baselines run 42376447534, reviewed.
<!-- SECTION:NOTES:END -->
