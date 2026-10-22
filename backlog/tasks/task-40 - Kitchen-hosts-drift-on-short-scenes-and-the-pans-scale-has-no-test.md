---
id: TASK-40
title: 'Kitchen hosts drift on short scenes, and the pan''s scale has no test'
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-21 12:52'
updated_date: '2026-10-22 04:19'
labels:
  - layer-ui
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
From TASK-36's review (2026-10-21):
1. Hosts are sized size * scale, but the Mascot's 44 dp minimum target is not scaled. When size * scale < 44 (for a 62 dp host, a scene under about 425 dp tall), the Pressable is larger than the art and centres it, so the art shifts right and down by (44 - size*scale)/2 from its place in the world. The bubble also draws at full size. Keeping the unscaled target and bubble is right for accessibility; the drift is not.
2. Nothing tests the new scale multiply in panKeyframes; the existing tests run at scale 1.

## Affected users and systems
KitchenScene on Welcome, on short screens (landscape, small phones).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On a scene under 425 dp tall, each host's art sits at its place in the world while its target stays at least 44 x 44
- [ ] #2 A test checks that sceneMotion(false, w, s) puts far * s at the 57% keyframe
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Reproduce: host is size*scale but Mascot's Pressable has an unscaled 44 dp min target that centres the art, so on short scenes the art shifts by (44 - size*scale)/2.
Change: scene-layout.ts gains targetDrift(size, scale, target) = -max(0, target - size*scale)/2; KitchenScene applies it as marginLeft/marginTop on each host so the art stays at its world place while the target and bubble keep full size. Test: targetDrift unit tests, and sceneMotion(false, w, 1.5) 57% keyframe equals far*1.5.
Modified files: packages/ui/src/organisms/kitchen/KitchenScene.tsx, packages/ui/src/organisms/kitchen/art/scene-layout.ts, packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. KitchenScene applies targetDrift(size, scale, target) (new in art/scene-layout.ts) as marginLeft/marginTop on each host, so the art keeps its world place while the 44 dp target and bubble stay unscaled. AC1: unit tests on targetDrift (scale 0.5 on a 62 host pulls back by half the excess; no drift once art >= target); computed, not a screenshot (visual tool freezes at first frame on WORLD-size window). AC2: new test sceneMotion(false, 300, 1.5) 57% keyframe equals far*1.5. Checks: pnpm check, typecheck, pnpm test (1542 passed, 116 files), visual (398 compared) pass. Baselines: none changed, none new.
<!-- SECTION:NOTES:END -->
