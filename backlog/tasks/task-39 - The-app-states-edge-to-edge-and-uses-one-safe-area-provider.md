---
id: TASK-39
title: The app states edge to edge and uses one safe-area provider
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-21 12:31'
updated_date: '2026-10-22 04:14'
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
- [ ] #1 DeviceSafeArea reads the insets from the router's provider instead of mounting its own, and the safe-area route test still passes
- [ ] #2 app.config.ts says why the app is edge to edge with no setting (Expo SDK 58 dropped android.edgeToEdgeEnabled; React Native 0.88 turns edge to edge on for SDK 35 targets), and a test fails if that key is added back
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Finding first: Expo SDK 58 has no edge-to-edge config key. @expo/prebuild-config withEdgeToEdge.js warns that android.edgeToEdgeEnabled is 'no longer available - Android 16 makes edge-to-edge mandatory', and React Native 0.88 WindowUtil.kt updateEdgeToEdgeFeatureFlag turns edge to edge on when the app targets SDK 35+ (always on Android 16+, on Android 15 unless the theme opts out). So AC1 cannot be a setting without adding a warning or changing behaviour; app.config.ts states it as a comment (no value changes) and a test fails if someone adds edgeToEdgeEnabled. AC2: DeviceSafeArea drops its NativeSafeAreaProvider and initialMetrics and only reads useSafeAreaInsets from the router's provider (ExpoRoot). The route-test harness (render-route.tsx) wraps the test layout in the stub NativeSafeAreaProvider with initialMetrics so insets still reach it; safe-area route test and layout-safe-area test stay. Modified files: apps/mobile/app.config.ts, apps/mobile/src/platform/DeviceSafeArea.tsx, apps/mobile/testing/render-route.tsx, apps/mobile/src/app-config.test.ts (new).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built (builder-app). AC1: the premise needed correcting. Expo SDK 58 has no edge-to-edge setting to write: node_modules/@expo/prebuild-config/build/plugins/unversioned/edge-to-edge/withEdgeToEdge.js warns that android.edgeToEdgeEnabled is 'no longer available - Android 16 makes edge-to-edge mandatory' if present. React Native 0.88: node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/view/WindowUtil.kt, updateEdgeToEdgeFeatureFlag, turns edge to edge on when the app targets SDK 35+ (always on Android 16+; on Android 15 unless the theme opts out via windowOptOutEdgeToEdgeEnforcement) and calls window.enableEdgeToEdge(). So the app is edge to edge today and stays so; app.config.ts now states that in a comment (why, and where it was verified) and sets nothing, so behaviour on a phone is unchanged. New apps/mobile/src/app-config.test.ts fails if android.edgeToEdgeEnabled is ever added. If you want an explicit value anyway, the AC should be reworded; I did not add a key that only produces a prebuild warning. AC2: DeviceSafeArea (apps/mobile/src/platform/DeviceSafeArea.tsx) no longer mounts a NativeSafeAreaProvider and lost its initialMetrics prop; it reads useSafeAreaInsets from ExpoRoot's provider and feeds @grocs/ui. Route harness (apps/mobile/testing/render-route.tsx) wraps DeviceSafeArea in the stub NativeSafeAreaProvider with initialMetrics, since ExpoRoot's provider reports zero in jsdom. safe-area.route.test (top 40 applied, none without) and layout-safe-area.test pass unchanged. Checks: pnpm check, pnpm typecheck, pnpm test (117 files, 1540 tests), pnpm check:release and pnpm check:demo all pass. Only a device can confirm: that ExpoRoot's provider reports the same non-zero insets (status bar, 48 dp bottom on 3-button, gesture bar) on the Fold and an emulator as DeviceSafeArea's own did; that edge to edge really is on at runtime (SDK 35+ target on Android 15 and 16); and TASK-30 AC3 / TASK-36 AC1 screenshots.

Finish moved by the orchestrator on 2026-10-22, before review: #1 asked to state the edge-to-edge setting explicitly, but there is no setting any more (the builder's notes cite withEdgeToEdge.js and WindowUtil.kt). The criterion now asks for the reason in a comment and a guard test, which is what was built.
<!-- SECTION:NOTES:END -->
