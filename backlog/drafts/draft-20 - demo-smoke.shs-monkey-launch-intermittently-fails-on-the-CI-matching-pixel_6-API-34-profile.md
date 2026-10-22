---
id: DRAFT-20
title: >-
  demo-smoke.sh's monkey launch intermittently fails on the CI-matching
  pixel_6/API 34 profile
status: Draft
assignee: []
created_date: '2026-10-22 23:14'
labels: []
dependencies: []
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
- [ ] #1 demo-smoke.sh reliably launches the app on a pixel_6/API 34 AVD (CI's profile) across repeated clean installs, either by making the monkey launch reliable or by switching to am start
- [ ] #2 A monkey/launch failure is reported with its own distinct message, not folded into the generic "Try the demo did not appear" timeout
<!-- AC:END -->
