---
id: TASK-36
title: Welcome's button sits under the navigation bar on an Android emulator
status: To Do
assignee: []
created_date: '2026-10-21 05:17'
updated_date: '2026-10-21 12:26'
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
<!-- SECTION:NOTES:END -->
