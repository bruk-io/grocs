---
id: TASK-34
title: The kitchen's pan never shows the whole cast on a tall phone
status: To Do
assignee: []
created_date: '2026-10-21 03:08'
updated_date: '2026-10-21 03:51'
labels:
  - size-2
  - layer-ui
dependencies:
  - TASK-31
modified_files:
  - packages/ui/src/organisms/kitchen/art/scene-layout.ts
  - packages/ui/src/organisms/kitchen/motion.ts
  - packages/ui/src/organisms/kitchen/KitchenScene.tsx
  - packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by TASK-31's reviewer (2026-10-20). Since TASK-31, KitchenScene scales the 1020 x 600 world to its window height (about 1.3x on a 412 x 915 phone). The pan keyframes stop at translateX -630 world units, tuned for scale 1. At 1.3x the window shows about 310 world units, so at the far stop it shows x 630-940: Enoki (917-973) never comes fully into view (about 22 of 56 units), and Cremi (584-648) is fully in view only mid-pan. At rest only Shii and the fridge are in frame. Suggested fix: derive the pan stops from the visible world width (window width / scale), for example clamping the last stop to -(WORLD.width - visibleWidth).

## Affected users and systems
Welcome, the first screen anyone sees; packages/ui KitchenScene.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On 360 x 640, 412 x 915 and the Fold inner screen, every mascot in the scene comes fully into frame at some point in the pan
- [ ] #2 Pan stops are computed from the window's visible world width, with unit tests at scale 1 and at 1.3
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Reproduce: at scale 1.3 (412x915) the window shows about 310 world units, so the fixed -630 stop shows x 630-940 and Enoki (917-973) is cut off.
Change: scene-layout.ts gains panStops(visibleWidth) returning mid and far: far = -(WORLD.width - visibleWidth) clamped to at most 0 (the kitchen's right edge, so Enoki is whole); mid centres Cremi in the window, clamped between far and 0. panKeyframes becomes panKeyframes(visibleWidth); sceneMotion(reduced, visibleWidth) passes it through. KitchenScene measures window width as well as height, visibleWidth = width / scale, and memoises the motion on it.
Tests: panStops unit tests at scale 1 and 1.3; for 360x640, 412x915 and the Fold inner screen every mascot's extent lies inside the visible span at some pan stop; reduced stays still. Visual: run the pass; list changed baselines in notes.
Modified files: packages/ui/src/organisms/kitchen/art/scene-layout.ts, motion.ts, KitchenScene.tsx, KitchenScene.behaviour.test.tsx
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. Files: packages/ui/src/organisms/kitchen/art/scene-layout.ts (panStops(visibleWidth) -> {mid, far}; panKeyframes(visibleWidth)), motion.ts (sceneMotion(reduced, visibleWidth)), KitchenScene.tsx (measures window width and height; visibleWidth = width / scale; motion memoised on it), KitchenScene.behaviour.test.tsx. Far stop = -(WORLD.width - visibleWidth) (kitchen's right edge, clamped to 0); mid centres Cremi.
AC2: panStops unit tests at scale 1 (393 wide: far -627, mid centres the stove) and 1.3 (412 wide: far about -703, beyond the old -630), plus a test that the scene motion's 57% keyframe uses far, and one that nothing moves past the left edge on a very wide window.
AC1: tests sweep the pan from 0 to far for 360x640 (scale 1.067), 412x915 (1.525 of the full-height window; the test uses window height 915) and Fold inner 791x820 and assert every mascot (all six placements) is fully inside the visible span at some stop. This is computed geometry, not a screenshot: the visual tool freezes the animation at its first frame, so no baseline shows the far stop.
Checks: pnpm check, pnpm typecheck, pnpm test (1435, 108 files), build-storybook and visual (359 compared) pass. Baselines: none changed, none new.
<!-- SECTION:NOTES:END -->
