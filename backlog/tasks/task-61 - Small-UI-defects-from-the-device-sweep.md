---
id: TASK-61
title: Small UI defects from the device sweep
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 19:50'
updated_date: '2026-11-07 14:09'
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
- [ ] #1 With the keyboard open, the first tap on Add (quick add) or Paste adds or pastes instead of only closing the keyboard
- [x] #2 The join screen's error message wraps inside the screen; it currently runs off the right edge
- [x] #3 Checking an invite code shows progress text, not just a spinner, while the cold-start call runs (5 to 30 s observed)
- [x] #4 Copy diagnostics confirms the copy in the app (iOS shows no system feedback)
- [x] #5 Settings' back link names the screen it returns to (it says Groceries when opened from Meal plan)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
AC #4 (edit-meal date pill clipping on Android) moved to its own task TASK-76 on 2026-11-07: it needs an Android device and the Android SDK was gone from this machine, so it could not be reproduced or verified here.

Fixes (9141832): #1 TaskLayout's ScrollView has keyboardShouldPersistTaps='handled', so a tap on Add/Paste inside a task form acts while the keyboard is open; checked on the iOS simulator (quick add: typed with keyboard up, one tap on Add, item on Groceries). Not checked on Android (SDK missing); the prop is cross-platform. Paste uses the same ScrollView but was not tapped separately. #2 TextField's error text sits in a flex:1 box so it wraps: simulator screenshot /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/2026-11-07_081545/verify-pat/takeScreenshot/6-error-wrap.png and baseline templates-invite-retry--invalid. #3 InviteRetryTemplate shows 'Checking with the server. The first check can take up to half a minute.' under the button while checking; state/story Checking, behaviour test. #4 PreferencesTemplate diagnosticsCopied: the button reads '✓ Copied' after a successful copy; story Copied, behaviour test, route test asserts it after Copy diagnostics; seen on the simulator. #5 PreferencesTemplate backLabel; Plan opens Settings via go.settingsFromPlan (?from=plan), whose back link says Meal plan and returns there; route test and simulator run. Baselines from visual-baselines run 42376447534, reviewed.

Reviewed by philosophy:reviewer: not closed. AC #1 not met on the evidence, though the worker ticked it: the quick-add shot 8-quickadd-keyboard (all three verify-jo runs) shows no on-screen keyboard, so the first tap on Add was not tested with the keyboard open, and Paste was not tapped at all. The TASK-73 run's first tap was on the action bar, outside the ScrollView, so it does not test keyboardShouldPersistTaps either. Needed: a run with the software keyboard visible (e.g. simulator hardware keyboard off), one tap on Add and one on Paste in the meal form, with screenshots. ACs #2-#5 are met (shots 6-error-wrap, 1-settings-from-plan, 2-copied, behaviour and route tests, baselines). close-task refuses: a bug closes with its repro recorded (record-check <id> --repro -- <test>, which must fail, so it has to be recorded against the pre-fix code by the worker), or a note starting 'No repro:'.

AC #1 unticked 2026-11-07 after review: the quick-add screenshots show no on-screen keyboard, so the first-tap claim was not proven. Re-proving with a keyboard-visible run on Paste and Add.

Repro at 1eac62643963, test files: apps/mobile/e2e/quick-add-first-tap.yaml; command: `maestro --device 9EB5207C-C6E9-4EF9-807C-D5519575A9DB test -e RUN_ID=pre3 apps/mobile/e2e/quick-add-first-tap.yaml` exited 1

(4 earlier lines omitted)
```text
    Clear keychain... COMPLETED
  Run flow when Platform is IOS... COMPLETED
  Launch app "io.bruk.grocs.dev" with clear state... COMPLETED
  Assert that "Continue with Google" is visible... COMPLETED
  Open grocs://dev-sign-in?as=${ACCOUNT}... COMPLETED
  Assert that "Groceries|Your kitchen" is visible... COMPLETED
Run subflows/sign-in.yaml... COMPLETED
Assert that "Nothing on the list yet" is visible... COMPLETED
Tap on "Add an item", Below "Nothing on the list yet"... COMPLETED
Assert that "Paste a few items at once, one per line." is visible... COMPLETED
Tap on point (35%,27%)... COMPLETED
Input text ${ITEM}... COMPLETED
Wait for animation to end... COMPLETED
Take screenshot quick-add-keyboard-open... COMPLETED
Tap on "Add"... COMPLETED
Tap on "Groceries"... COMPLETED
Assert that "${ITEM}" is visible... FAILED

Assertion is false: "E2E first tap pre3" is visible

Assertion '"E2E first tap pre3" is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.

Possible causes:
- Element selector may be incorrect - check if there are similar elements with slightly different names/properties.
- Element may be temporarily unavailable due to loading state
- This could be a real regression that needs to be addressed

==== Debug output (logs & screenshots) ====

/Users/brukhabtu/.maestro/tests/2026-11-07_090542
```

AC #1 re-proven 2026-11-07 with apps/mobile/e2e/quick-add-first-tap.yaml (keyboard shown, one tap on Add, item must appear on Groceries). Pre-fix (TaskLayout from origin/main, Metro restarted with --clear so the bundle really had it): keyboard visible, the tap only closed it, flow failed - recorded above as the repro (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/qa-pre/2026-11-07_090405/quick-add-first-tap/takeScreenshot/quick-add-keyboard-open.png). With the fix (Metro restarted again): keyboard visible (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/post/2026-11-07_090649/quick-add-first-tap/takeScreenshot/quick-add-keyboard-open.png), one tap added the item, flow passed. Why the earlier quick-add shots had no keyboard is unexplained (simulator); this run has it. Paste: the meal form's Paste button is not wired at all (AddMealScreen passes no onPasteLink), so there was nothing to tap-test; filed as its own bug. Learned: Metro started in this worktree does not pick up file edits (no hot reload), so a pre-fix check needs a Metro restart.
<!-- SECTION:NOTES:END -->
