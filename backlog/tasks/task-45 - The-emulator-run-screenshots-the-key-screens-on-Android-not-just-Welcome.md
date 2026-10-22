---
id: TASK-45
title: 'The emulator run screenshots the key screens on Android, not just Welcome'
status: In Progress
assignee: []
created_date: '2026-10-21 12:09'
updated_date: '2026-10-22 20:08'
labels:
  - ci
  - testing
  - size-3
dependencies: []
modified_files:
  - tools/demo-smoke.sh
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
The visual baselines only render Storybook on react-native-web. TASK-36 (Welcome's button clipped under the navigation bar) passed all 362 browser screenshots and broke on Bruk's Fold and the CI emulator, because Android's layout and edge-to-edge drawing differ from the browser's. The demo-apk emulator job only checks that 'Try the demo' appears; the launcher 'isn't responding' dialog covered it in runs before TASK-28's fix. Bruk asked (2026-10-21) whether we follow standard React Native practice; on-device checks of key screens on an emulator are the usual guard.

Scoped to Welcome only (orchestrator investigation, 2026-10-22): a Groceries/Add-a-meal version needs coordinate-tap navigation through the app and is a separate, larger follow-up (filed once this lands).

Investigated the detection mechanism directly against the pre-TASK-36 build on a pixel_6/API 34-shaped emulator: tools/demo-smoke.sh already runs `uiautomator dump --windows`, which gives the "Try the demo" button's bounds. Comparing those bounds against the display's root rect (e.g. [0,0][1080,2400]) does NOT catch the bug - the button sits at [408,2321][672,2374], fully inside the display rect. The actual overlap is with the system navigation bar's reserved inset, found via `adb shell dumpsys window displays`: `InsetsSource ... type=navigationBars frame=[0,2337][1080,2400]`. The button's bottom (2374) extends 37px past the nav bar's top (2337) - that overlap, not display-rect containment, is what the check must assert against.

## Affected users and systems
tools/demo-smoke.sh, .github/workflows/demo-apk.yml; Welcome's layout on Android.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 tools/demo-smoke.sh fails when the Welcome screen's Try the demo button overlaps the system navigation bar's inset (from adb shell dumpsys window displays), not just when it is outside the display's root bounds
- [x] #2 A system dialog from another app does not fail the run or false-negative the check (TASK-28's fix already covers this for Welcome; confirm it still holds with the new assertion added)
- [x] #3 Run against the commit before TASK-36's fix (370062a) and against current main, the check fails on Welcome's clipped button with the same message both times - the overlap this check detects is still present on main, not just historically (see the filed follow-up bug); the check's own correctness was verified on both API 34 (pixel_6, matching CI) and API 36
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In tools/demo-smoke.sh, after the existing wait loop confirms "Try the demo" is shown (the ui.xml dump already captured), parse the button's bounds out of ui.xml and the navigationBars inset frame out of `adb shell dumpsys window displays` (the InsetsSource line with type=navigationBars). Fail with a clear message naming the rule (why this check exists - R-reference or plain English) when the button's bottom extends past the nav bar's top (rectangle overlap, not display-bounds containment - containment alone passes the known-broken build).
2. Keep this as a shell-only addition (grep/sed/awk over the existing adb output this script already pulls) - no new dependency, no Python, no Maestro, consistent with the rest of the script.
3. Prove it both ways locally before touching CI: build the pre-TASK-36 demo APK (370062a) and the current main demo APK, run the updated script against each on a pixel_6/API-34-shaped emulator, confirm the old one fails with the new check's message and the new one passes.
4. No CI workflow changes needed - demo-smoke.sh is already invoked unchanged by .github/workflows/demo-apk.yml's smoke job.

### Risks
- The navigationBars InsetsSource line's exact format could vary by Android version/emulator config; parse it defensively (grep for `type=navigationBars` and extract the frame=[x1,y1][x2,y2] group) and fail loudly with the raw dumpsys output if the line isn't found, rather than silently skipping the check.
- Gesture-nav devices with no rendered nav-bar accessibility node still report the InsetsSource via dumpsys (confirmed during investigation), so this works for both 3-button and gesture navigation.

### Proof
Local run of the updated tools/demo-smoke.sh against the pre-fix APK (370062a) failing with the new overlap message, and against the current main APK passing - both on an emulator matching CI's profile (api 34, pixel_6).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented: tools/demo-smoke.sh now compares the clickable Button ancestor of "Try the demo" (found by bounds containment over the label - the label itself is not clickable, measuring it alone understates the control's real footprint and was an early mistake caught and fixed during this work) against the navigationBars inset from `adb shell dumpsys window displays`, failing on overlap with a message naming both bounds.

AC2 (dialog coverage) verified by code reading, not a fresh live repro: the new check runs only inside `if [ "$shown" -eq 1 ]`, and shown only becomes 1 once the wait loop's dump already contains "Try the demo" text - the same condition TASK-28's existing dialog-dismiss logic guards. A covering dialog's dump would not contain that text, so the new check cannot run while one is up; TASK-28's protection is structurally a prerequisite for this check, not something it needs to re-verify.

AC3 (fails on both the historical and current build) verified far more thoroughly than planned, on two emulators: a pixel_6/API 36 AVD and a freshly-built pixel_6/API 34 AVD matching CI's demo-apk.yml smoke job exactly (downloaded the system image, confirmed via `./gradlew app:properties`: targetSdk 36/compileSdk 37). All four combinations (2 builds x 2 API levels), with clean installs and settled renders, show the identical overlap: label bounds [408,2321][672,2374], clickable Button bounds [63,2274][1017,2400] (bottom flush with the screen edge), navigationBars frame [0,2337][1080,2400]. This means the check currently fails on CURRENT MAIN too, not just the historical commit - the overlap TASK-36 was meant to fix is still present. Filed as DRAFT-20 (UI-layer, filed as an observation only per the UI/backend boundary, not picked up by any agent). Confirmed demo-apk.yml does not trigger on push to main (workflow_dispatch, push to apk/** branches, demo-v* tags only), so landing this check does not turn main's CI red - it will correctly fail the next time someone cuts a demo tag or dispatches the workflow, until DRAFT-20 is resolved.

Full suite green: pnpm check (14), pnpm typecheck, pnpm test.
<!-- SECTION:NOTES:END -->
