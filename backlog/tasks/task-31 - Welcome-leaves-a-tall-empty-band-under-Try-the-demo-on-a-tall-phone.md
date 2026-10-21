---
id: TASK-31
title: Welcome leaves a tall empty band under Try the demo on a tall phone
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 02:08'
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

Built. Files: StageLayout.tsx (stage flex:1 on the scene's ceiling colour; wordmark now in the stage's flow, not absolute; sheet sizes to content), KitchenScene.tsx (outside the named files: window bottom-anchors the 600-high world, ceiling colour above, so the floor meets the sheet), SignInTemplate.stories.tsx (OnTallPhone 412x915, OnShortPhone 360x640 via a sized-frame decorator), layouts.behaviour.test.tsx (StageLayout assertions follow the wordmark moving into the flow; no test loosened). AC1: tall baseline shows floor meeting the sheet, sheet = button + 24 + gesture bar; the top band is the ceiling colour (TASK-29 note done). AC2: short baseline shows the button fully visible; the scene loses its ceiling and top of the cast shelf instead. AC3: templates-sign-in--on-tall-phone* and --on-short-phone* added. Caveat: the visual tool shoots at its fixed viewports (393x852, 412x929, 791x820), so the 412-wide frame is clipped to 393 in the iphone image and the 360x640 frame sits in the corner of a 393x852 image; the fold-outer image is the true 412 view. Checks: pnpm check, typecheck, pnpm test (1422), visual (359 compared) pass. Baselines for Bruk to approve - NEW: templates-sign-in--on-tall-phone{,--fold-outer,--fold-inner}.png, --on-short-phone{,--fold-outer,--fold-inner}.png. CHANGED: all templates-sign-in--{rest,primary-action,with-footer,on-phone}{,--fold-outer,--fold-inner}.png (sheet now content-height, stage fills above, wordmark in flow), organisms-kitchen-scene--{panning,reduced}.png (window bottom-anchored with ceiling colour).

Second pass (orchestrator feedback). KitchenScene now measures its window and scales the 1020x600 world uniformly to the window height (transform scale, origin top left; sides clip and the pan carries on). StageLayout: wordmark is absolute again (top = 24 + top inset) over the scene's own ceiling; the stage holds the scene full height, so there is no plain band at any height and on the short phone (360x640) the whole cast, both lower mascots included, is visible. Tall story decorator now uses a minimum-size frame so the sheet colour runs to the bottom edge (the lighter strip was the story frame, 915, inside a 929 browser viewport); short story keeps an exact frame. No file outside packages/ui touched. Checks: pnpm check, typecheck, pnpm test (1422), visual (359 compared) pass. Baselines regenerated; same set as before: new on-tall-phone and on-short-phone (x3 viewports), changed all templates-sign-in--* and organisms-kitchen-scene--* (scene now scaled to its window, about 1.0 in those stories) images.
<!-- SECTION:NOTES:END -->
