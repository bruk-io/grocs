---
id: TASK-39
title: The app states edge to edge and uses one safe-area provider
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-21 12:31'
updated_date: '2026-10-22 04:35'
labels:
  - layer-app
  - size-2
  - finish-moved
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
From TASK-36's inset audit (2026-10-21, code reading):
- apps/mobile/app.config.ts sets no edge-to-edge option, yet Expo SDK 58 and RN 0.88 target SDK 35 or later, where React Native turns edge to edge on (always on from Android 16). So the app draws under the navigation bar by default, and the layouts depend on the bottom inset being right, with nothing in the repo saying so.
- apps/mobile/src/platform/DeviceSafeArea.tsx mounts a second native SafeAreaProvider inside the one expo-router's ExpoRoot already mounts (TASK-30's reviewer saw the same). Both report window-relative insets, so it does not double count, but it is redundant.

## Affected users and systems
apps/mobile app config and root layout; every screen's insets on Android.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 DeviceSafeArea reads the insets from the router's provider instead of mounting its own, and the safe-area route test still passes
- [x] #2 app.config.ts says why the app is edge to edge with no setting (Expo SDK 58 dropped android.edgeToEdgeEnabled; React Native 0.88 turns edge to edge on for SDK 35 targets), and a test fails if that key is added back
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Finding first: Expo SDK 58 has no edge-to-edge config key. @expo/prebuild-config withEdgeToEdge.js warns that android.edgeToEdgeEnabled is 'no longer available - Android 16 makes edge-to-edge mandatory', and React Native 0.88 WindowUtil.kt updateEdgeToEdgeFeatureFlag turns edge to edge on when the app targets SDK 35+ (always on Android 16+, on Android 15 unless the theme opts out). So AC1 cannot be a setting without adding a warning or changing behaviour; app.config.ts states it as a comment (no value changes) and a test fails if someone adds edgeToEdgeEnabled. AC2: DeviceSafeArea drops its NativeSafeAreaProvider and initialMetrics and only reads useSafeAreaInsets from the router's provider (ExpoRoot). The route-test harness (render-route.tsx) wraps the test layout in the stub NativeSafeAreaProvider with initialMetrics so insets still reach it; safe-area route test and layout-safe-area test stay. Modified files: apps/mobile/app.config.ts, apps/mobile/src/platform/DeviceSafeArea.tsx, apps/mobile/testing/render-route.tsx, apps/mobile/src/app-config.test.ts (new).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built (builder-app). AC1: the premise needed correcting. Expo SDK 58 has no edge-to-edge setting to write: node_modules/@expo/prebuild-config/build/plugins/unversioned/edge-to-edge/withEdgeToEdge.js warns that android.edgeToEdgeEnabled is 'no longer available - Android 16 makes edge-to-edge mandatory' if present. React Native 0.88: node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/view/WindowUtil.kt, updateEdgeToEdgeFeatureFlag, turns edge to edge on when the app targets SDK 35+ (always on Android 16+; on Android 15 unless the theme opts out via windowOptOutEdgeToEdgeEnforcement) and calls window.enableEdgeToEdge(). So the app is edge to edge today and stays so; app.config.ts now states that in a comment (why, and where it was verified) and sets nothing, so behaviour on a phone is unchanged. New apps/mobile/src/app-config.test.ts fails if android.edgeToEdgeEnabled is ever added. If you want an explicit value anyway, the AC should be reworded; I did not add a key that only produces a prebuild warning. AC2: DeviceSafeArea (apps/mobile/src/platform/DeviceSafeArea.tsx) no longer mounts a NativeSafeAreaProvider and lost its initialMetrics prop; it reads useSafeAreaInsets from ExpoRoot's provider and feeds @grocs/ui. Route harness (apps/mobile/testing/render-route.tsx) wraps DeviceSafeArea in the stub NativeSafeAreaProvider with initialMetrics, since ExpoRoot's provider reports zero in jsdom. safe-area.route.test (top 40 applied, none without) and layout-safe-area.test pass unchanged. Checks: pnpm check, pnpm typecheck, pnpm test (117 files, 1540 tests), pnpm check:release and pnpm check:demo all pass. Only a device can confirm: that ExpoRoot's provider reports the same non-zero insets (status bar, 48 dp bottom on 3-button, gesture bar) on the Fold and an emulator as DeviceSafeArea's own did; that edge to edge really is on at runtime (SDK 35+ target on Android 15 and 16); and TASK-30 AC3 / TASK-36 AC1 screenshots.

Finish moved by the orchestrator on 2026-10-22, before review: #1 asked to state the edge-to-edge setting explicitly, but there is no setting any more (the builder's notes cite withEdgeToEdge.js and WindowUtil.kt). The criterion now asks for the reason in a comment and a guard test, which is what was built.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(754 earlier lines omitted)
```text
|  storybook-static/assets/PreferencesTemplate.stories-B6X6L1GZ.js
|  4.69 kB │ gzip:   1.82 kB
|  storybook-static/assets/ItemRow-CL-odj_r.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/Button-mAbb9PVx.js
|  6.43 kB │ gzip:   2.03 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/GroceryListTemplate.stories-DZZS859y.js
|  9.35 kB │ gzip:   3.11 kB
|  storybook-static/assets/Mascot-9wOdy4H3.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-BrtJGt-P.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-DLUJ5bxM.js
|  17.99 kB │ gzip:   5.00 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-V5bZC6s3.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CYAHSAHA.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-BjFF9lkE.js
|  1,360.62 kB │ gzip: 392.04 kB

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

|  Vite ✓ built in 4.71s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.8s of this 4.7s
|  build (82%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 1.6s, 835
|  calls)
|  - plugin vite:css transform (28%, 1.3s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a1d8487c3f9c3a159/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 398 story views checked (axe, 44 x 44, 398 images compared)
```

Reviewed by philosophy:reviewer. Closed. Full check (record-check --tier full) exit 0, no files reformatted. Citations verified in node_modules: withEdgeToEdge.js line 41 warns edgeToEdgeEnabled is no longer available; WindowUtil.kt checks isAtLeastTargetSdk35 and calls window.enableEdgeToEdge(). #1: DeviceSafeArea only calls useSafeAreaInsets; its only app render site is app/_layout.tsx (the root layout under ExpoRoot's provider), the other is the test harness, which wraps it in the stub native provider; safe-area.route.test still asserts padding-top 40 with insets and under 40 without, so insets are proven applied. #2: comment in app.config.ts, and app-config.test.ts guards the key. Findings, none filed: (low) layout-safe-area.test checks the layout source with a regex, not that it sits under ExpoRoot - that is structural in expo-router, so no realistic path to zero insets; (info) runtime insets and edge to edge on a device stay unverified, already listed in the builder's notes and covered by TASK-30 AC3 / TASK-36 AC1.
<!-- SECTION:NOTES:END -->
