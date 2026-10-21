---
id: TASK-36
title: Welcome's button sits under the navigation bar on an Android emulator
status: To Do
assignee: []
created_date: '2026-10-21 05:17'
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
