---
id: TASK-29
title: Screens draw under the phone's status bar and gesture bar
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
updated_date: '2026-10-20 23:50'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
SafeAreaProvider/useSafeArea (zero default) in packages/ui/src/platform/safe-area.tsx; MainLayout, TaskLayout, StageLayout, ActionBar read it (top padding, bottom clearance, side insets); OnPhone story per full-screen template via withPhoneInsets decorator; layouts.behaviour.test.tsx; two size tokens for the stories' phone insets.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built in worktree. Provider: SafeAreaProvider/useSafeArea/NO_INSETS/PHONE_INSETS exported from @grocs/ui (PHONE_INSETS = tokens phoneStatusBar 40 / phoneGestureBar 24, new tokens in tokens.json). Layouts: Main pads top, lifts tab bar and last row by bottom; Task pads top and clears bottom for footer or last content (ActionBar does it itself); Stage shifts scene and wordmark below the top inset and extends the sheet colour under the gesture bar; ActionBar adds bottom and side insets. Evidence: AC1 layouts.behaviour.test.tsx (11 tests, zero-inset and phone-inset cases); AC2 the zero-inset values are the old values, so the tests fail without the padding; AC3 OnPhone story on all 9 templates (iphone, fold-outer, fold-inner), checked by eye on sign-in and meal-form; the visual pass has no automated inset-band check (tools/visual.ts is outside layer-ui, so not added; suggest a follow-up); AC4 visual pass: 326 existing images unchanged, no existing PNG modified. Changed baselines: none. New baselines (27 PNGs, 9 templates x 3 viewports): templates-{grocery-list,invite-join,invite-retry,item-picker,kitchen-setup,meal-form,meal-plan,preferences,sign-in}--on-phone[--fold-outer|--fold-inner].png, plus manifest.json. Note: on Welcome the band above the scene shows the stage colour (lighter than the sky); worth a look. pnpm check, typecheck, full pnpm test (1410) and visual all pass. Not done: app feeding real insets (TASK-30).
<!-- SECTION:NOTES:END -->
