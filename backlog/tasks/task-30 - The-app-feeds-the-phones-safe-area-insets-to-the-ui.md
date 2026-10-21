---
id: TASK-30
title: The app feeds the phone's safe-area insets to the ui
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 01:12'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-29
modified_files:
  - apps/mobile/src/platform/DeviceSafeArea.tsx
  - apps/mobile/app/_layout.tsx
  - apps/mobile/testing/render-route.tsx
  - apps/mobile/testing/route-setup.ts
  - apps/mobile/testing/stubs/react-native-safe-area-context.cjs
  - apps/mobile/src/routes/safe-area.route.test.tsx
  - apps/mobile/src/layout-safe-area.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. The app half of TASK-29: the root layout (apps/mobile/app/_layout.tsx) has no SafeAreaProvider, though react-native-safe-area-context is already a dependency, so the ui never learns the status bar and gesture bar sizes.

## Affected users and systems
apps/mobile root layout; every screen.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The root layout wraps the app in SafeAreaProvider and passes its insets to the ui's inset provider
- [ ] #2 A route test renders Groceries with non-zero insets and finds them applied
- [ ] #3 On a demo APK on an Android phone the Settings button can be tapped and no header text sits under the status bar, with a screenshot in the notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
DeviceSafeArea (apps/mobile/src/platform): wraps children in react-native-safe-area-context's SafeAreaProvider (aliased NativeSafeAreaProvider), and an inner component reads useSafeAreaInsets and passes them to @grocs/ui's SafeAreaProvider. Root layout wraps Slot in it. Tests: the safe-area stub honours initialMetrics; renderRoute takes optional insets; route-setup mocks the library for the app's own import; safe-area.route.test renders Groceries with top 40 and finds the padding; a source test checks the root layout wiring. #3 needs a device.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Resized from 1 to 2 before work started (2026-10-20): route tests do not render apps/mobile/app/_layout.tsx, and the react-native-safe-area-context test stub always returns zero insets, so proving #2 needs a small design (for example a component the root layout uses, and a stub that honours initialMetrics) rather than numbered steps.

Built: DeviceSafeArea (apps/mobile/src/platform/DeviceSafeArea.tsx) wraps the app in react-native-safe-area-context's SafeAreaProvider (imported as NativeSafeAreaProvider) and feeds useSafeAreaInsets to @grocs/ui's SafeAreaProvider; the root layout wraps Slot in it. Test support: the safe-area stub now honours initialMetrics (zero by default), renderRoute takes optional insets, route-setup.ts vi.mocks the library for the app's own import (Vite loads it, not the Node hook that stubs it for expo-router). AC1: _layout.tsx wraps Slot in DeviceSafeArea, checked by layout-safe-area.test.ts. AC2: safe-area.route.test.tsx renders Groceries with top inset 40 and finds padding-top 40 above the Add an item box, and under 40 without insets. AC3: NOT MET - needs a demo APK on an Android phone (Settings tappable, no header text under the status bar, screenshot); left for the orchestrator. pnpm check and pnpm typecheck pass; pnpm test passes (1421). Note: one run of the full suite had a failure in a composition/observe test that does vi.resetModules and a dynamic import (timeout under load); it passed alone and on two reruns, unrelated to this change.
<!-- SECTION:NOTES:END -->
