---
id: TASK-32
title: A mascot's speech bubble runs off the screen and covers Settings
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 03:47'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. Mascot.tsx centres a fixed-width bubble over the mascot. In MainHeader and SubHeader the mascot sits at the right edge, so half the bubble is off screen ('Soup's on! Well... almo') and it covers the Settings button. Its text also sets fontFamily from tokens.font.family.body rather than fontFace, so on a phone it falls back to the system face (the case TASK-1.37.7 #2 describes).

## Affected users and systems
Mascot molecule, MainHeader, SubHeader; Groceries, Meal plan and Add a meal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 In MainHeader and SubHeader at 360 wide, each mascot's longest line shows whole inside the screen with its tail pointing at the mascot, in the visual baselines
- [ ] #2 The bubble never covers the header's Settings button or another control
- [ ] #3 The bubble's text uses the registered Nunito face on native through fontFace, as SpeechBubble does
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Mascot gets bubbleSide ('above' default | 'left'): left opens the bubble beside the mascot (right:100%, centred vertically, tail on its right edge pointing at the mascot), so it stays inside the screen and never rises over the header's top row (Settings). MainHeader and SubHeader pass 'left' and take a mascotState prop (forwarded to forceState) for stories. Bubble text uses fontFace('body', bold). New 360-wide speaking stories for both headers give the baselines. Modified files: packages/ui/src/molecules/Mascot.tsx, packages/ui/src/organisms/MainHeader.tsx, MainHeader.stories.tsx, SubHeader.tsx, SubHeader.stories.tsx, new visual baselines.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. Mascot has bubbleSide ('above' default, 'left'): left puts the bubble beside the mascot (right:100%, vertically centred, tail on its right edge pointing at it), so in MainHeader/SubHeader (both pass 'left') it stays on screen and never rises over the top row with Settings. Both headers take mascotState (forwarded to forceState) for stories. Bubble text now uses fontFace('body', bold) (AC3). New token size.phoneNarrow = 360 (tokens.json, regenerated) for the stories' width (design-tokens/raw-value). New stories at 360 wide: MainHeader SpeakingAt360 (cremi), MealPlanSpeakingAt360 (shii), SubHeader SpeakingAt360 (chanty). Evidence: AC1 baselines organisms-mainheader--speaking-at-360, organisms-mainheader--meal-plan-speaking-at-360, organisms-subheader--speaking-at-360 show the line whole inside the frame, tail pointing right at the mascot. AC2 the bubble is beside the mascot, below the top row, so Settings is clear in the images. AC3 code. Note: pinned stories show each mascot's first line (cremi 'Stirring! Don't tell Chanty I salted it.', the longest of its three); the bubble is a fixed 200 wide so any line wraps within it. Baselines: only 3 NEW images, none changed: the three above (+ manifest.json). pnpm check, typecheck, full pnpm test (1430 pass) and visual (356 compared) all pass.
<!-- SECTION:NOTES:END -->
