---
id: TASK-29
title: Screens draw under the phone's status bar and gesture bar
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
labels:
  - size-3
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. Android draws apps edge to edge, and nothing in packages/ui or apps/mobile reads the safe-area insets, so:
- Groceries' 'Week of Oct 19' and Add a meal's '< Meal plan' back link sit under the clock.
- The Settings button in the top-right corner sits under the battery icon and cannot be tapped.
- 'Add to Thursday' sits on the gesture bar, and the mascot's bubble overlaps the status bar.

This is the ui half: the layouts take the insets from a ui provider, as PlatformStyleProvider and MotionProvider do, so @grocs/ui stays free of native libraries and stories can show a phone's insets. The app feeds the real insets in a follow-on task.

## Affected users and systems
Every screen; packages/ui layouts (MainLayout, TaskLayout, StageLayout, ActionBar) and any full-screen template that does not use them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every screen layout and full-screen template keeps its top content below the top inset and its bottom actions above the bottom inset, read from a ui provider whose default is zero insets
- [ ] #2 A behaviour test per layout fails without the inset padding and passes with it
- [ ] #3 Each full-screen template has a story with a phone's insets in the visual baselines, with no control or text inside the inset bands
- [ ] #4 With zero insets the existing baselines are unchanged
<!-- AC:END -->
