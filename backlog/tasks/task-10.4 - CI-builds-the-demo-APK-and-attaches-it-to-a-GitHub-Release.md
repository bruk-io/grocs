---
id: TASK-10.4
title: CI builds the demo APK and attaches it to a GitHub Release
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 17:28'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Prove first, then fix: build the demo APK in CI with no autolinking change and smoke-test it on an emulator, to learn whether @react-native-firebase launches without google-services.json. 2. .github/workflows/demo-apk.yml (ubuntu-24.04; Node 24, pnpm/action-setup@v6, setup-node@v7, checkout@v7, upload-artifact@v7, JDK 17 temurin): triggers workflow_dispatch, push to apk/** and tags demo-v*. Job build: install, check the demo JS bundle holds no Firebase (below), expo prebuild --platform android --no-install with APP_VARIANT=demo and EXPO_PUBLIC_APP_VARIANT=demo, gradlew assembleRelease with both set, upload the APK. Job smoke: download the APK, reactivecircus/android-emulator-runner (KVM enabled on the runner), install, launch, wait, fail on FATAL EXCEPTION in logcat or process gone, screenshot uploaded as an artifact. Job release: needs smoke, only on refs/tags/demo-v*, permissions contents: write on that job only, gh release create with the APK attached. The header comment says how to cut a demo release (push a demo-vX.Y.Z tag) and what the signing means. 3. A check that the demo JS bundle holds no Firebase code: tools/demo-bundle.ts exports the demo bundle with the same flags as tools/release-bundle.ts, reads the sourcemap module list, fails on any @react-native-firebase, firebase, @grocs/providers-firebase or composition/native.ts module, and fails blind if the demo bundle lacks the demo modules (so it can see). Unit tests for the pure part; wired as pnpm check:demo and into the workflow build job. 4. If the app crashes without google-services.json: apps/mobile/react-native.config.js, variant-aware (APP_VARIANT=demo sets platforms android/ios null for the three @react-native-firebase packages); real build unchanged. Verify with expo-modules-autolinking react-native-config for both variants. 5. Signing: the Expo template signs release with the debug keystore, generated fresh on each CI run; documented in the workflow header. 6. Iterate on branch apk/demo until build and smoke pass; download the artifact and look at the screenshot. 7. Run pnpm check, typecheck, test, check:release; commit with hooks; report in notes.
<!-- SECTION:PLAN:END -->
