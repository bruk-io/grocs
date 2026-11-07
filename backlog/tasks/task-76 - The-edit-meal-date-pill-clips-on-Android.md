---
id: TASK-76
title: The edit-meal date pill clips on Android
status: To Do
assignee: []
created_date: '2026-11-07 13:33'
labels:
  - size-1
  - ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Split from TASK-61 #4 on 2026-11-07: it needs an Android device to reproduce and check, and the Android SDK was missing from this machine (~/Library/Android gone), so it could not be worked with the rest. Tag (packages/ui/src/atoms/Tag.tsx) already uses per-weight font families on the phones, so the usual Android fontWeight clipping is not the cause; start by reproducing on the fold emulator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The edit-meal date pill shows the whole label on Android (it clips to 'Thursday, Nov')
<!-- AC:END -->
