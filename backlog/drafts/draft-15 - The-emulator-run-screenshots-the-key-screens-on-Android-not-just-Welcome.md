---
id: DRAFT-15
title: 'The emulator run screenshots the key screens on Android, not just Welcome'
status: Draft
assignee: []
created_date: '2026-10-21 12:09'
updated_date: '2026-10-21 12:09'
labels:
  - ci
  - testing
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
The visual baselines only render Storybook on react-native-web. TASK-36 (Welcome's button clipped under the navigation bar) passed all 362 browser screenshots and broke on Bruk's Fold and the CI emulator, because Android's layout and edge-to-edge drawing differ from the browser's. The demo-apk emulator job only checks that 'Try the demo' appears; the launcher 'isn't responding' dialog covered it in runs before TASK-28's fix. Bruk asked (2026-10-21) whether we follow standard React Native practice; on-device screenshots of key screens on an emulator (for example with Maestro) are the usual guard.

## Affected users and systems
.github/workflows/demo-apk.yml, tools/demo-smoke.sh; every screen's layout on Android.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The emulator job screenshots Welcome, Groceries after Try the demo, and Add a meal, uploads them, and fails when a control the screen names is not fully on screen
- [ ] #2 Run against the commit before TASK-36's fix, it fails on Welcome's clipped button
- [ ] #3 A system dialog from another app does not fail the run or cover the screenshots (TASK-28's fix holds for every screenshot)
<!-- AC:END -->
