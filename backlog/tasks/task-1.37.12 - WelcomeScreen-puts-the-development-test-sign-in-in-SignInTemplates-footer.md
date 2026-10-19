---
id: TASK-1.37.12
title: WelcomeScreen puts the development test sign-in in SignInTemplate's footer
status: To Do
assignee: []
created_date: '2026-10-19 10:57'
updated_date: '2026-10-19 10:58'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-1.37.11
modified_files:
  - apps/mobile/src/screens/WelcomeScreen.tsx
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The app half of the split TASK-1.37.11 (from the TASK-1.37.4 review). The development test sign-in (R53) is absolutely positioned over the foot of WelcomeScreen, so on a short phone or with large text it can cover Continue with Google or 'Open it to join'. Development builds only.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 WelcomeScreen passes the development test sign-in into SignInTemplate's footer instead of overlaying it, and the Welcome route tests pass
- [ ] #2 pnpm check:release still shows the test sign-in absent from release bundles
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/WelcomeScreen.tsx: on SignInTemplate add {...(dev ? { footer: <DevSignIn dev={dev} /> } : {})} and delete the sibling line {dev ? <DevSignIn dev={dev} /> : null}.
2. Same file: change styles.dev to { alignItems: 'center' } (drop position, left, right and bottom). Leave styles.screen as is.
3. Run pnpm test and confirm the Welcome route tests, including the development sign-in ones, pass unchanged.
4. Run pnpm check:release and confirm it passes (the test sign-in stays out of release bundles).
5. Run pnpm check and pnpm typecheck. Fix anything they report inside apps/mobile.
<!-- SECTION:PLAN:END -->
