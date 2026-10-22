---
id: TASK-46
title: >-
  demo-smoke.sh's monkey launch intermittently fails on the CI-matching
  pixel_6/API 34 profile
status: In Progress
assignee: []
created_date: '2026-10-22 23:14'
updated_date: '2026-10-22 23:18'
labels:
  - size-1
dependencies: []
modified_files:
  - tools/demo-smoke.sh
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Reproduced independently twice (orchestrator and a reviewer dispatched for TASK-45) on a fresh pixel_6/API 34 AVD ('ci34', matching .github/workflows/demo-apk.yml's smoke job device profile and API level exactly). tools/demo-smoke.sh launches the app with `adb shell monkey -p $package -c android.intent.category.LAUNCHER 1`. On a clean install on this AVD, monkey's own process aborted immediately: logcat shows `app_process: System.exit called, status: -5` / `AndroidRuntime: VM exiting with result code -5` right after printing its args, before the app's process is ever started. No FATAL EXCEPTION from the app, no pidof hit - the app never got a launch intent. The script's wait loop times out and reports a generic "did not appear" failure, not a monkey failure, so a CI run hitting this would misdiagnose the app as broken.

Worked around for both investigations by using `adb shell am start -n $package/.MainActivity` instead, which launched the app immediately and let the dump/screenshot/bounds checks run normally.

## Affected users and systems
tools/demo-smoke.sh, .github/workflows/demo-apk.yml's smoke job.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 demo-smoke.sh reliably launches the app on a pixel_6/API 34 AVD (CI's profile) across repeated clean installs, either by making the monkey launch reliable or by switching to am start
- [x] #2 A monkey/launch failure is reported with its own distinct message, not folded into the generic "Try the demo did not appear" timeout
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In tools/demo-smoke.sh, replace `adb shell monkey -p "$package" -c android.intent.category.LAUNCHER 1` with `adb shell am start -n "$package/.MainActivity"`. am start is deterministic (no monkey's input-injection machinery, which is what aborted with "System.exit called, status: -5" on the reproduced AVD) and was used successfully in both independent reproductions.
2. Give a monkey/launch-specific failure its own message rather than folding into the generic "did not appear" timeout: capture am start's own exit status and stderr, and fail immediately with that detail if the launch command itself errors, instead of only finding out 120 seconds later from the wait loop.
3. Keep the wait loop's existing logic (dump/screenshot polling, dialog dismissal, crash detection) unchanged - only the launch mechanism changes.

### Risks
- am start's intent (`-n package/.MainActivity`) is more specific than monkey's LAUNCHER category resolution; MainActivity is the fixed, known launcher activity name for this app (confirmed via `adb shell cmd package resolve-activity --brief io.bruk.grocs.demo` during investigation, which returned `io.bruk.grocs.demo/.MainActivity`), so this is not fragile to a future activity rename without also being caught immediately by a failed am start.

### Proof
Run the updated script against the current demo APK on a pixel_6/API 34 AVD (CI's profile), confirming it launches reliably across repeated clean installs and that an injected launch failure (e.g. a bad component name) produces a distinct, immediate error rather than the generic 120s timeout.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed: tools/demo-smoke.sh now launches via adb shell am start -n $package/.MainActivity instead of monkey. A real bug in the first pass of this fix was caught during verification: am start always prints 'Starting: Intent {...}' even when the component does not resolve, so checking for that line as a success signal was wrong - fixed to check for an 'Error' line instead (am's own exit status is not reliable across adb-shell/emulator image combos either).

Verified end to end on the ci34 (pixel_6/API 34, CI's profile) AVD: (1) the real launch now succeeds reliably across repeated clean installs, progressing straight past the launch step to the (separately tracked, expected) TASK-36 overlap check with no monkey crash and no wait-loop timeout; (2) a deliberately broken component name (.NotARealActivity, via a throwaway copy of the script) fails immediately with a distinct 'could not launch' message quoting am's own Error output, not the generic 120-second 'did not appear' timeout.
<!-- SECTION:NOTES:END -->
