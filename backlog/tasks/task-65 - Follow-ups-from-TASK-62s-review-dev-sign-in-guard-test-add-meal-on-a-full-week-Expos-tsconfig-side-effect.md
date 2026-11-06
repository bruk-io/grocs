---
id: TASK-65
title: >-
  Follow-ups from TASK-62's review: dev sign-in guard test, add-meal on a full
  week, Expo's tsconfig side effect
status: To Do
assignee: []
created_date: '2026-11-06 21:14'
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
- [ ] #1 A unit test fails if native.ts offers devSignIn in a build not connected to the emulators
- [ ] #2 add-meal.yaml does not depend on the current week having an open day
- [ ] #3 Running pnpm e2e leaves no apps/mobile/tsconfig.json behind, or the vitest suite is unaffected by it
<!-- AC:END -->
