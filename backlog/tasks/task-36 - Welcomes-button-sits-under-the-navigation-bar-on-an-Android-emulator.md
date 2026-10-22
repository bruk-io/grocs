---
id: TASK-36
title: Welcome's button sits under the navigation bar on an Android emulator
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-21 05:17'
updated_date: '2026-10-22 23:14'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Seen in the demo APK smoke screenshot from run 39545258100 (2026-10-21, main at the TASK-32 merge): a 1080 x 2400 emulator (about 411 x 914 dp) with 3-button navigation. 'Try the demo' is cut off at its bottom edge, behind the navigation bar. The gap between the tagline and the top of the kitchen is also larger than in the --on-phone and --on-tall-phone baselines, which show the button clear of the bottom. So on Android the stage, or the scaled KitchenScene inside it (TASK-31), appears to lay out taller than in the browser and pushes the sheet down, or the bottom inset is not applied. Not yet known which. The screenshot was taken behind a launcher 'isn't responding' dialog (DRAFT-15), so the screen is dimmed.

## Affected users and systems
Welcome, the first screen anyone sees; StageLayout, SignInTemplate, KitchenScene; the app's inset wiring (TASK-30).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On the demo APK on an Android device or emulator with 3-button navigation and with gesture navigation, 'Try the demo' sits whole above the navigation bar, with screenshots in the notes
- [ ] #2 The cause is named in the notes, and a test or story that fails on the cause is added where the browser can show it
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Stage 1 diagnosis: temporary [layout] console.log of onLayout sizes (StageLayout screen/stage/scene/sheet and insets, KitchenScene window), committed as DIAGNOSTIC; orchestrator returns logcat. Stage 2: name the cause, prefer layout-driven sizing (aspectRatio or viewBox) over onLayout plus transform scale, add a failing test or story, remove logs in own commit, visual:update only if baselines change. Suspect: the KitchenScene world is 600 dp tall in layout because a transform does not shrink the layout box, so on Android it may inflate the scene and stage past their flex share.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Stage 2 (builder-ui). Cause (not yet confirmed by device numbers; Bruk's Fold screenshot of the task-36-diagnostic overlay pending): KitchenScene laid out a fixed 1020 x 600 dp world and shrank it with a transform scale. A transform does not change the layout box, so the world stayed 600 dp tall in layout, and on Android (Yoga) that oversized in-flow child plus an onLayout measure-then-scale feedback is the likeliest thing to have inflated the scene and pushed the sheet off the bottom; the browser (CSS) clips it differently, which is why baselines looked right. Fix: the world is now position absolute, height 100% of its window, aspectRatio 1020/600, art scaled by its SVG viewBox, hosts and door placed in percentages, sides clipped. onLayout of the window remains only for the pan stops (px = world units x scale) and the hosts' pixel size, never for layout. Test: KitchenScene.behaviour.test.tsx 'layout (TASK-36)' (world absolute, height 100%, aspect ratio, no transform, no element drawn at a fixed 1020 or 600 px, hosts left in percent); the old code fails all three. Baselines: none changed (visual pass: 362 images compared, all match). Inset audit (read-only, code): (1) expo-router ExpoRoot mounts its own SafeAreaProvider and apps/mobile/src/platform/DeviceSafeArea.tsx adds a second inside it. Both report window-relative insets so they do not add, but the second is redundant; it only matters for passing insets into @grocs/ui, which useSafeAreaInsets from either gives. Not a double count. (2) apps/mobile/app.config.ts sets no edge-to-edge option; Expo SDK 58 / RN 0.88 targets SDK 35+, where React Native's WindowUtil.kt turns edge-to-edge on (always on Android 16+), so the app draws under the navigation bar and relies on the bottom inset. (3) StageLayout renders a spacer of inset.bottom under the sheet body, so the sheet is correct only if the native bottom inset is right; with 3-button navigation it should be 48 dp. Outside packages/ui (orchestrator to route): DeviceSafeArea could drop its own NativeSafeAreaProvider and use the router's; app.config.ts could state the edge-to-edge setting explicitly. Only a device can confirm: that Yoga was the cause, that the bottom inset arrives as nonzero on 3-button and gesture navigation, and that Try the demo sits whole above the bar (acceptance criterion 1).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(738 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-C5gLF-j_.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-nz_NcS2H.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-BXxKbH4C.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-DNMLVkV0.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BeyU00Yd.js
|  17.99 kB │ gzip:   5.00 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-2u7D0HhU.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-mBh1rsaE.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-f5cOUJnj.js
|  1,359.50 kB │ gzip: 391.76 kB

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

|  Vite ✓ built in 4.61s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.5s of this 4.6s
|  build (77%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 1.6s, 824
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
|  /home/claude/grocs/.claude/worktrees/agent-a88cc17eb2bdcf9e1/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 362 story views checked (axe, 44 x 44, 362 images compared)
```

Review (philosophy:reviewer, 2026-10-21): NOT CLOSED. #1 unmet: no device or emulator screenshots (CI billing blocked, no emulator in the container). #2 not ticked: the cause is named only as a hypothesis ('not yet confirmed by device numbers'). Yoga applies no min-size:auto, so a fixed 600 dp child of a flex:1, overflow-hidden window should not inflate it, and nothing shows that it did. The three new layout tests do fail on the code from before c589eb2 (checked by reading: there is no kitchen-world testID, the world and fill are 1020px/600px, and hosts use numeric left). They fail on the old structure, though, which is not proven to be the cause. Full check passed (exit 0; 362 visual images match; the tree is unchanged apart from this task file). No diagnostic code is left: the StageLayout and diagnostic-layout changes are fully reverted by 4e9eab6, and git diff 4c3fe03..HEAD touches only KitchenScene, its test, scene-layout, motion and this task. Findings: (medium) The Mascot's 44 dp minimum target is no longer scaled. When scale < 44/size (a scene under about 425 dp tall for a 62 dp host), the Pressable is larger than the art and centres it, so each host's art shifts right and down by (44 - size*scale)/2 from its world position. Its bubble also now draws at full size rather than scaled. The target and bubble sizes are arguably better for accessibility, but placement drifts on short scenes. Fix: offset the host by the target's excess, or anchor the art top-left. (low) No test covers panKeyframes' new scale multiply: the TASK-34 pan-stop tests still pass but only exercise scale 1. Add a sceneMotion(false, w, s) assertion that 57% equals far*s. (low) The pan and host sizes still come from onLayout, so the first frame renders at the WORLD default before it measures; this no longer feeds layout, so it is acceptable. Merge: ready to merge to main so the next APK can test it; the rework is sound apart from the medium finding, which is cosmetic.

Device check, finally (orchestrator + a reviewer dispatched for TASK-45, independently, 2026-10-22): AC1 is NOT met. Tested the commit before this task's own KitchenScene rework (370062a) and current main (same commit TASK-45 lands from) on two emulators - a pixel_6/API 36 AVD and a freshly-built pixel_6/API 34 AVD matching .github/workflows/demo-apk.yml's smoke job device profile and API level exactly (confirmed targetSdk 36/compileSdk 37 via ./gradlew app:properties). Clean installs (uninstall then install), launched via adb shell am start (monkey's LAUNCHER intent intermittently aborts on this AVD profile - filed separately as DRAFT-21, unrelated to the app), settled renders before each dump.

All four combinations (2 builds x 2 API levels) show the identical overlap: the "Try the demo" TextView label at bounds [408,2321][672,2374]; its clickable Button ancestor (found by bounds containment, since the label itself is not clickable) at [63,2274][1017,2400] - bottom flush with the screen's edge; adb shell dumpsys window displays reports the navigationBars inset at frame=[0,2337][1080,2400]. The button's clickable area is fully behind the 63px-tall nav bar on every build and API level tried, including CI's own target (pixel_6, API 34). Screenshots from both API levels visually confirm the same clipping the original demo APK smoke screenshot showed.

So: the KitchenScene rework (this task's actual code change) did not fix AC1, whatever its effect on the scene's own layout. The inset audit already on this task's notes named three real candidates (DeviceSafeArea's redundant second SafeAreaProvider, app.config.ts stating no explicit edge-to-edge setting, StageLayout's inset.bottom spacer) but did not test which (if any) is the actual cause - that's still open. Leaving this task open (AC1 unmet, AC2's cause still unconfirmed); it is layer-ui and out of this session's boundary to fix. A corresponding check now exists (TASK-45, demo-smoke.sh) that will fail CI's demo-apk smoke job the next time it runs against a build with this bug, rather than relying on a human noticing a screenshot.
<!-- SECTION:NOTES:END -->
