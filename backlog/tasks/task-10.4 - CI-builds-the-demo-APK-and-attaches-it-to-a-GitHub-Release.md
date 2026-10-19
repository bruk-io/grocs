---
id: TASK-10.4
title: CI builds the demo APK and attaches it to a GitHub Release
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 17:24'
labels:
  - size-3
  - ci
dependencies:
  - TASK-10.3
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: a workflow on GitHub's runners (Android SDK preinstalled) builds the demo variant's release APK and publishes it on a GitHub Release friends can download. Unknown to settle first: @react-native-firebase's Android build expects google-services.json, which the demo doesn't need and the repo must never hold (firebase-isolation, R51, R52). Signing with a throwaway or debug key is fine for sideloading; say which and why.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A workflow builds the demo APK on a pinned Ubuntu runner and attaches it to a GitHub Release, run by hand or on a version tag
- [ ] #2 The APK installs on Android (evidence: a run of the workflow, the artifact, and an install and launch on an Android emulator or device)
- [ ] #3 No Firebase config, keystore or secret is committed, and the repo says how to cut a new demo release
<!-- AC:END -->
