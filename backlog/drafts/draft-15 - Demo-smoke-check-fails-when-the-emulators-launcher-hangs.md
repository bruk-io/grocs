---
id: DRAFT-15
title: Demo smoke check fails when the emulator's launcher hangs
status: Draft
assignee: []
created_date: '2026-10-20 22:09'
labels:
  - ci
  - bug
dependencies: []
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
