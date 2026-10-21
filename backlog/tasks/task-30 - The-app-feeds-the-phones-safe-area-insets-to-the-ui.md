---
id: TASK-30
title: The app feeds the phone's safe-area insets to the ui
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 11:22'
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
- [x] #1 The root layout wraps the app in SafeAreaProvider and passes its insets to the ui's inset provider
- [x] #2 A route test renders Groceries with non-zero insets and finds them applied
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(738 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-DnKAOTKw.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-Ctucr5jb.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-4M_z6aGy.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-B5NSZ8OD.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-l7C9XySj.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-BL40qf8r.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DcGjcJ5l.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-GYdmVp5o.js
|  1,359.48 kB │ gzip: 391.74 kB

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

|  Vite ✓ built in 5.67s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.3s of this 5.6s
|  build (76%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (37%, 2.1s, 824
|  calls)
|  Additional callback time came from the callbacks below and from
|  callbacks under 1s.
|  1 callback is listed without a time. Its calls overlapped, so the time
|  inside one call includes work from other calls. To find its cost,
|  profile the build with `node --cpu-prof`:
|  - plugin vite:css transform (2 calls)
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-ad0efc286fa6db7a7/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 353 story views checked (axe, 44 x 44, 353 images compared)
```

Review (philosophy:reviewer, 2026-10-20): NOT CLOSED - #3 needs a demo APK and screenshot. #1 met: _layout.tsx wraps Slot in DeviceSafeArea, which feeds react-native-safe-area-context's useSafeAreaInsets into @grocs/ui's SafeAreaProvider; the source-text test is weak (it pins the JSX shape, not behaviour) but acceptable since route tests never render the root layout, and DeviceSafeArea itself is exercised by every route test through renderRoute. #2 met: safe-area.route.test.tsx finds padding-top 40 with top inset 40, and under 40 without. Harness change: the stub's defaults (zero insets, 393x852) are unchanged and now come from context defaults, so existing route tests see the same values; the vi.mock gives the app's import the same stub expo-router already got. Full check exited 0 in one run, including the kitchen and error-boundary route tests (no timeouts). Low findings, no drafts: expo-router's ExpoRoot already mounts a SafeAreaProvider, so DeviceSafeArea's is a nested one - harmless at the screen origin, and the #3 device check will confirm; the layout test would pass if DeviceSafeArea were swapped for a no-op. Code is ready to merge to main for the demo APK.

2026-10-21: Bruk reported on his Fold with the demo APK from run 39545258100: 'I can tap settings.' His Welcome screenshot shows the wordmark clear of the status bar. A Groceries screenshot is still wanted for #3.
<!-- SECTION:NOTES:END -->
