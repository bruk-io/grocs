---
id: TASK-40
title: 'Kitchen hosts drift on short scenes, and the pan''s scale has no test'
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-21 12:52'
updated_date: '2026-10-22 04:04'
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
