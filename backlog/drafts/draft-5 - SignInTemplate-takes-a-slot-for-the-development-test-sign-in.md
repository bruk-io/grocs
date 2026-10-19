---
id: DRAFT-5
title: SignInTemplate takes a slot for the development test sign-in
status: Draft
assignee: []
created_date: '2026-10-19 09:01'
labels:
  - size-1
  - layer-ui
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.4. The development test sign-in (R53) is placed from the app layer, absolutely positioned at the foot of the screen in apps/mobile/src/screens/WelcomeScreen.tsx, because the app builder couldn't edit ui. Nothing lays it out against the sign-in sheet, so on a short phone or with large text it can cover Continue with Google or 'Open it to join'. Development builds only.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 SignInTemplate takes an optional slot below the sign-in actions, with a story showing it filled, and WelcomeScreen passes the development test sign-in into it instead of overlaying it
- [ ] #2 pnpm check:release still shows the test sign-in absent from release bundles
<!-- AC:END -->
