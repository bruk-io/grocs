---
id: TASK-34
title: The kitchen's pan never shows the whole cast on a tall phone
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-21 03:08'
updated_date: '2026-10-21 03:37'
labels:
  - size-2
  - layer-ui
dependencies:
  - TASK-31
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
