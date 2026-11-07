---
id: TASK-65
title: >-
  Follow-ups from TASK-62's review: dev sign-in guard test, add-meal on a full
  week, Expo's tsconfig side effect
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 21:14'
updated_date: '2026-11-07 13:36'
labels:
  - size-1
  - e2e
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the reviewer's close of TASK-62 (740b4bb). (1) native.ts's devSignIn guard (dev tools present AND connected to the emulators) is what keeps the dev-sign-in link off live data, but the route tests inject a fake devSignIn, so nothing fails if that line is edited wrongly. (2) e2e/add-meal.yaml taps the first 'Plan a meal' of the current week; a week with every day planned would fail it without a real bug (the reseed before each run prevents it today). (3) Starting Expo here writes apps/mobile/tsconfig.json (gitignored) extending expo/tsconfig.base, which breaks 15 vitest files until deleted; anyone who runs the flows hits it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A unit test fails if native.ts offers devSignIn in a build not connected to the emulators
- [ ] #2 add-meal.yaml does not depend on the current week having an open day
- [x] #3 Running pnpm e2e leaves no apps/mobile/tsconfig.json behind, or the vitest suite is unaffected by it
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#1: the devSignIn decision moved to apps/mobile/src/composition/dev-sign-in-gate.ts (devSignInFor), which native.ts calls; dev-sign-in-gate.test.ts fails if a release build (no dev tools) or a dev build on live Firebase (no emulator functions) is offered it. #3: tools/e2e.ts runs the --build step through removingWhatItCreates, which deletes apps/mobile/tsconfig.json after prebuild if the run created it and keeps one that was already there (tested in tools/e2e.test.ts with a fake fs, including a failing step). Metro alone (expo start) did not recreate the file in this session; prebuild does. #2: add-meal.yaml steps a week ahead while no 'Plan a meal' shows, and after saving steps forward until the meal shows (saving returns the plan to this week: TASK-75). Proof on the iPhone simulator: filled every day of Alex's week with a scratch flow, then add-meal.yaml passed against the full week.

pnpm e2e --ios on the simulator (reseeded, normal week) after these changes: add-and-tick-item, add-meal, sign-in all passed. The two-device and household flows need an Android device too and were not run (Android SDK missing).
<!-- SECTION:NOTES:END -->
