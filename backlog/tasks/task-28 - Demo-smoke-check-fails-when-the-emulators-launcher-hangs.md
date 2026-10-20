---
id: TASK-28
title: Demo smoke check fails when the emulator's launcher hangs
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-20 22:09'
updated_date: '2026-10-20 22:28'
labels:
  - ci
  - bug
  - size-2
dependencies: []
modified_files:
  - tools/demo-smoke.sh
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
The demo APK smoke check (tools/demo-smoke.sh, step 'Install and launch it on an emulator' in demo-apk.yml) failed on run 39501055452 although the app was fine: logcat shows io.bruk.grocs.demo MainActivity displayed in 1.9 s and the screenshot shows the Welcome screen with 'Try the demo'. A 'Quickstep isn't responding' system dialog (the emulator's launcher) covered it, so the UI dump held only android and com.android.systemui nodes and the check timed out after 120 s.

## Affected users and systems
tools/demo-smoke.sh, .github/workflows/demo-apk.yml. Blocks the release step on a demo-v* tag when it happens.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A system 'isn't responding' dialog from another app does not fail the smoke check while the demo app is displayed
- [ ] #2 The check still fails when the demo app crashes or its Welcome screen never appears
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In tools/demo-smoke.sh's polling loop, after the existing 'Try the demo' check and before the loop body ends, add a check for a system 'isn't responding' dialog in the pulled ui.xml (grep -qi "isn.t responding"). If found, send a BACK keyevent (adb shell input keyevent KEYCODE_BACK) to dismiss it, so the next iteration's dump can see past it instead of spending the whole 120 s budget staring at someone else's dialog. This does not change what makes the check fail: the FATAL EXCEPTION grep and the pidof liveness check, both already outside this loop, are untouched.

### Risks
Not independently testable here (no real demo APK or emulator with the APK installed is available in this environment; the script only runs for real inside android-emulator-runner in CI). The fix is validated on the next real demo-apk.yml run, same as TASK-10.4's own release-job half was. The BACK keypress only fires when the dump's text actually matches 'isn't responding', so it cannot dismiss the demo app's own UI by mistake.

### Proof
Read-through: the loop still breaks on FATAL EXCEPTION or a dead process exactly as before (AC2 unaffected); the new branch only adds a dismiss-and-retry path when the dump's content signals a foreign system dialog is in the way (AC1).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a dismiss-and-retry branch in the polling loop: when the pulled ui.xml matches 'isn't responding' (case-insensitive), send KEYCODE_BACK and let the loop continue. The FATAL EXCEPTION and pidof checks outside the loop are untouched, so AC2 still holds. Not independently testable here - no real demo APK/emulator combination available in this environment; validated on the next real demo-apk.yml run. pnpm check passes (14 checks).
<!-- SECTION:NOTES:END -->
