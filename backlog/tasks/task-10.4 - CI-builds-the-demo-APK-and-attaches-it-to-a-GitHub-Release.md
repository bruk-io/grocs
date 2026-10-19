---
id: TASK-10.4
title: CI builds the demo APK and attaches it to a GitHub Release
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 19:03'
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
- [x] #2 The APK installs on Android (evidence: a run of the workflow, the artifact, and an install and launch on an Android emulator or device)
- [x] #3 No Firebase config, keystore or secret is committed, and the repo says how to cut a new demo release
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Prove first, then fix: build the demo APK in CI with no autolinking change and smoke-test it on an emulator, to learn whether @react-native-firebase launches without google-services.json. 2. .github/workflows/demo-apk.yml (ubuntu-24.04; Node 24, pnpm/action-setup@v6, setup-node@v7, checkout@v7, upload-artifact@v7, JDK 17 temurin): triggers workflow_dispatch, push to apk/** and tags demo-v*. Job build: install, check the demo JS bundle holds no Firebase (below), expo prebuild --platform android --no-install with APP_VARIANT=demo and EXPO_PUBLIC_APP_VARIANT=demo, gradlew assembleRelease with both set, upload the APK. Job smoke: download the APK, reactivecircus/android-emulator-runner (KVM enabled on the runner), install, launch, wait, fail on FATAL EXCEPTION in logcat or process gone, screenshot uploaded as an artifact. Job release: needs smoke, only on refs/tags/demo-v*, permissions contents: write on that job only, gh release create with the APK attached. The header comment says how to cut a demo release (push a demo-vX.Y.Z tag) and what the signing means. 3. A check that the demo JS bundle holds no Firebase code: tools/demo-bundle.ts exports the demo bundle with the same flags as tools/release-bundle.ts, reads the sourcemap module list, fails on any @react-native-firebase, firebase, @grocs/providers-firebase or composition/native.ts module, and fails blind if the demo bundle lacks the demo modules (so it can see). Unit tests for the pure part; wired as pnpm check:demo and into the workflow build job. 4. If the app crashes without google-services.json: apps/mobile/react-native.config.js, variant-aware (APP_VARIANT=demo sets platforms android/ios null for the three @react-native-firebase packages); real build unchanged. Verify with expo-modules-autolinking react-native-config for both variants. 5. Signing: the Expo template signs release with the debug keystore, generated fresh on each CI run; documented in the workflow header. 6. Iterate on branch apk/demo until build and smoke pass; download the artifact and look at the screenshot. 7. Run pnpm check, typecheck, test, check:release; commit with hooks; report in notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 19, 2026, builder report. Built: .github/workflows/demo-apk.yml (ubuntu-24.04, Node 24, JDK 17; triggers workflow_dispatch, push to apk/**, tag demo-v*; jobs build, smoke, release; release has contents: write on that job only and runs only on a demo-v* tag, after build and smoke pass; the header says how to cut a demo release: push a demo-vX.Y.Z tag). tools/demo-bundle.ts (pnpm check:demo, run in the build job): exports the demo bundles with the release flags and both variables, and fails on any @react-native-firebase, @firebase, firebase, providers-firebase, composition/native.ts or compose-firebase.ts module, and fails 'blind' when the bundle holds no demo composition or in-memory provider. Unit tests in tools/demo-bundle.test.ts. Against a real (non-demo) bundle the same Firebase patterns match 115 modules, so the check can see Firebase. tools/release-bundle.ts now exports bundlesIn and exportBundles (extraEnv); no behaviour change. tools/demo-smoke.sh: installs, launches by monkey, polls the UI dump for 'Try the demo' for up to 120 s, then fails on FATAL EXCEPTION in logcat, a missing process, or a missing Welcome screen; screenshot, UI dump and logcat are uploaded as the smoke-output artifact either way.

Firebase autolinking, proved: the first run (39295220560) built the demo APK with @react-native-firebase/{app,auth,firestore} autolinked and no google-services.json. It installed and ran: logcat showed only 'FirebaseApp: Default FirebaseApp failed to initialize because no default options were found' and 'ReactNativeFirebaseApp: received application context', no crash, and the Welcome screen drew. (That run's smoke step failed only because a Google Play services ANR put a 'System UI isn't responding' dialog over the screen on the google_apis image, so the UI dump saw the dialog; the screenshot underneath showed Welcome with 'Try the demo'. Fixed by using the plain default emulator image, 4 cores, 4 GB, and dumping all windows.) So no autolinking exclusion was added. I wrote and tested a variant-aware apps/mobile/react-native.config.js (expo-modules-autolinking drops the three packages for android and ios when APP_VARIANT=demo, keeps them otherwise) and removed it, since the app launches without it. It is the fix to reach for if a later @react-native-firebase upgrade starts crashing at launch; the smoke test is what would show it.

Passing run: 39301929518 on apk/demo at commit 0e82f89: build 21 min (34 min on the cold first run; the Gradle cache is saved now), smoke 2 min, release job skipped (not a tag). Artifacts: grocs-demo-apk (grocs-demo.apk, 59 MB, arm64-v8a and x86_64 only) and smoke-output; the screenshot shows the Welcome screen with 'Try the demo', and logcat has no FATAL EXCEPTION. The release job is untested end to end because no demo-v* tag exists; its YAML parses and it was skipped as designed.

Signing: Expo's prebuild template signs release with the debug keystore, generated fresh on every CI run, so no keystore or secret is committed or needed. A friend with an older demo installed must uninstall it before installing a newer one (Android refuses an update signed by another key); the workflow header and the Release notes say so. A stable key, so updates install over each other, would need a keystore stored as a repository secret, which only Bruk can add (and the build would need a signing config added to the prebuilt project, a small config plugin). Nothing else needs a secret or setting: the release job uses the workflow's own token with contents: write.

Other: the real build sets neither variable (ci.yml unchanged; check:demo sets them only in its child process; the workflow sets them only on the prebuild and Gradle steps). Branch apk/demo is left on origin (cannot delete it from here). I squashed my iterations into one commit because the weakening check (loosen-check-config) flags removing a line from a workflow even when the file is new on the branch.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(520 earlier lines omitted)
```text
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 5.45s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.3s of this 5.4s
|  build (61%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (29%, 1.6s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (22%, 1.2s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a51d043119a2c7e72/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a51d043119a2c7e72/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review by philosophy:reviewer (Oct 19, 2026): not closed. AC1 unmet only on its release half; AC2 and AC3 ticked. Full-tier check exited 0, no files rewritten.
AC1: the build half is evidenced (run 39301929518 on ubuntu-24.04, workflow_dispatch and demo-v* tag triggers). The release half has never run: tag pushes are refused from the sandbox. From the code it looks right: release needs [build, smoke], runs only on refs/tags/demo-v*, contents: write on that job only, gh release create --verify-tag --repo with the APK renamed per tag and notes covering install and uninstall-before-update. Unproven until a run exists. To complete: after merge Bruk pushes demo-v0.1.0 from main; the run's release job passes and the Release page shows grocs-demo-demo-v0.1.0.apk with those notes; then tick AC1 and close.
AC2: smoke-output from 39301929518: welcome.png shows Welcome with Try the demo; logcat has no FATAL EXCEPTION or AndroidRuntime error, only the FirebaseApp 'no default options' warning and FirebaseInitProvider 'initialization unsuccessful'.
AC3: no google-services.json, keystore or secret in git ls-files; the workflow header says how to cut a release.
Firebase autolinking left in: sound, since the app launches and the smoke test would catch a crash after a @react-native-firebase upgrade. The fallback (variant-aware react-native.config.js) is written only in these notes, not in the repo. Low: worth a line in the workflow header.
check:demo: the unit tests cover firebase-in-demo, blind and not-the-demo, and the CI log shows it passing on 2 bundles. It is wired into demo-apk.yml only, not ci.yml (DRAFT-8).
release-bundle.ts: export keywords plus extraEnv, default {} and spread last. check:release passes no extraEnv, so its behaviour is unchanged; it passed in the full check.
Variant variables: ci.yml sets neither; demo-apk.yml sets them only on the prebuild and Gradle steps.
Signing: uninstall-before-update is in the Release notes text, where a friend sees it, and in the header.
Weakening: a real false positive. The pre-commit check judges each commit against its parent, so iterating a workflow that is new on its branch trips it. Filed as DRAFT-9.
UX: the demo's Google button is prominent but does nothing, while Try the demo is a small text link. Filed as DRAFT-7.
<!-- SECTION:NOTES:END -->
