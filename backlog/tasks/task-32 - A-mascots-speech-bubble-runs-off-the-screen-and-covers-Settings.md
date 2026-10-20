---
id: TASK-32
title: A mascot's speech bubble runs off the screen and covers Settings
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
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
