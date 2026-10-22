---
id: DRAFT-20
title: >-
  Welcome's "Try the demo" button still overlaps the navigation bar on a real
  device/emulator
status: Draft
assignee: []
created_date: '2026-10-22 20:07'
labels: []
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found verifying TASK-45's new demo-smoke.sh check (orchestrator investigation, 2026-10-22). TASK-36 ("Welcome's button sits under the navigation bar on an Android emulator") was closed as fixed, but the overlap reproduces identically on current main.

## Observed evidence
Both builds tested: the commit before TASK-36's fix (370062a) and current main (same commit TASK-45 lands from). Clean installs (uninstall then install, not an upgrade), launched via `adb shell am start -n io.bruk.grocs.demo/.MainActivity` (monkey's LAUNCHER launch failed intermittently on one AVD with "System.exit status: -5", unrelated to the app - am start was used instead once that was confirmed by checking `pm list packages` / `cmd package resolve-activity` showed the package installed and resolvable fine), with a settle wait before each dump.

Two emulators, two Android versions:
- "gm" AVD: pixel_6 device profile, Android 16 (API 36, "Baklava"), targetSdk 36/compileSdk 37 (confirmed via `./gradlew app:properties`).
- "ci34" AVD: pixel_6 device profile, Android 14 (API 34, "UpsideDownCake") - matches .github/workflows/demo-apk.yml's smoke job (`api-level: 34`, `profile: pixel_6`) exactly.

On all four runs (2 builds x 2 API levels), `adb shell uiautomator dump --windows` reports the "Try the demo" TextView label at identical bounds `[408,2321][672,2374]`, and `adb shell dumpsys window displays` reports the navigationBars inset at `frame=[0,2337][1080,2400]` - the label's bottom (2374) is 37px past the nav bar's top (2337). The clickable Button ancestor (found by bounds containment, since the TextView is not itself clickable) is `[63,2274][1017,2400]` - its bottom sits exactly at the display's edge, fully behind the 63px-tall nav bar. Screenshots from both API levels show the button's bottom edge visibly cut off by the system bar, matching bit-for-bit what the DRAFT-15 investigation first saw on the pre-fix commit.

One control variable: `window_animation_scale`/`transition_animation_scale`/`animator_duration_scale` were set to 0 on both AVDs partway through this investigation, to let `uiautomator dump` reach an idle state against the Welcome scene's continuous animation (it reported "could not get idle state" otherwise). This was done identically for both builds and both API levels, so it does not explain a difference between them, but it was not tested with animations at their default scale, and RN's reduced-motion detection on Android reads exactly these settings - whether that changes the Welcome screen's own layout (not just animation) was not checked.

## Affected users and systems
apps/mobile's Welcome screen on Android (packages/ui, apps/mobile - UI layer; filed here as an observation only, not a diagnosis, per the UI/backend boundary this session works under).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A UI-layer investigation confirms or rules out the overlap on a real device or CI's actual emulator job, and either fixes it or explains why these four local reproductions do not reflect what ships
<!-- AC:END -->
