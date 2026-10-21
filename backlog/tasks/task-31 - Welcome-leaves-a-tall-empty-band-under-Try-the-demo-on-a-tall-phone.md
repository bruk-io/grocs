---
id: TASK-31
title: Welcome leaves a tall empty band under Try the demo on a tall phone
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 00:45'
labels:
  - size-2
  - layer-ui
dependencies:
  - TASK-29
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. SignInTemplate draws the kitchen scene at its own height (WORLD.height) and gives the sheet flex: 1, so on a 20:9 phone the sheet below the button is mostly empty white.

## Affected users and systems
Welcome (SignInTemplate, StageLayout), the first screen anyone sees.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On a tall phone viewport (412 x 915) the kitchen scene takes the space above the sheet, its floor meeting the sheet, and the sheet is only as tall as its content plus the bottom inset
- [ ] #2 On a short phone viewport (360 x 640) the button stays fully visible without scrolling
- [ ] #3 Both viewports are in the visual baselines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
From TASK-29's review: with phone insets, Welcome (StageLayout) paints the 40-point band above the kitchen scene in the stage colour, lighter than the scene's sky (see packages/ui/visual-baselines/templates-sign-in--on-phone*.png). Cosmetic, nothing sits in the band; worth fixing alongside this Welcome layout work by filling the inset with the sky colour.
<!-- SECTION:NOTES:END -->
