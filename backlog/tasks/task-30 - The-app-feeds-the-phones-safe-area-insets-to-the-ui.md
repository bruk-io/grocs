---
id: TASK-30
title: The app feeds the phone's safe-area insets to the ui
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-29
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. The app half of TASK-29: the root layout (apps/mobile/app/_layout.tsx) has no SafeAreaProvider, though react-native-safe-area-context is already a dependency, so the ui never learns the status bar and gesture bar sizes.

## Affected users and systems
apps/mobile root layout; every screen.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The root layout wraps the app in SafeAreaProvider and passes its insets to the ui's inset provider
- [ ] #2 A route test renders Groceries with non-zero insets and finds them applied
- [ ] #3 On a demo APK on an Android phone the Settings button can be tapped and no header text sits under the status bar, with a screenshot in the notes
<!-- AC:END -->
