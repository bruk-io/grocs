---
id: DRAFT-16
title: The app states edge to edge and uses one safe-area provider
status: Draft
assignee: []
created_date: '2026-10-21 12:31'
labels:
  - layer-app
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
From TASK-36's inset audit (2026-10-21, code reading):
- apps/mobile/app.config.ts sets no edge-to-edge option, yet Expo SDK 58 and RN 0.88 target SDK 35 or later, where React Native turns edge to edge on (always on from Android 16). So the app draws under the navigation bar by default, and the layouts depend on the bottom inset being right, with nothing in the repo saying so.
- apps/mobile/src/platform/DeviceSafeArea.tsx mounts a second native SafeAreaProvider inside the one expo-router's ExpoRoot already mounts (TASK-30's reviewer saw the same). Both report window-relative insets, so it does not double count, but it is redundant.

## Affected users and systems
apps/mobile app config and root layout; every screen's insets on Android.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 app.config.ts states the edge-to-edge setting explicitly, with a comment on why
- [ ] #2 DeviceSafeArea reads the insets from the router's provider instead of mounting its own, and the safe-area route test still passes
<!-- AC:END -->
