---
id: TASK-1.37.12
title: WelcomeScreen puts the development test sign-in in SignInTemplate's footer
status: In Progress
assignee:
  - '@builder-app-small'
created_date: '2026-10-19 10:57'
updated_date: '2026-10-19 13:48'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented plan steps 1-2 in apps/mobile/src/screens/WelcomeScreen.tsx: the dev test sign-in now goes into SignInTemplate's footer via {...(dev ? { footer: <DevSignIn dev={dev} /> } : {})} and the sibling line is gone; styles.dev is { alignItems: 'center' } (position, left, right, bottom dropped); styles.screen unchanged. Also removed the now-unused tokens import from that file (a direct consequence of step 2, needed for typecheck/lint).

Verification: pnpm test passed (88 files, 1193 tests). The Welcome route tests (apps/mobile/src/routes/screens.route.test.tsx and index.route.test.tsx), including the development test sign-in (R53) and the release-build absence cases, pass unchanged. pnpm run check:release passed ('release bundles clean (2 bundles, 4 dev-only path patterns)'). pnpm typecheck passed. pnpm check passed (13 checks). It printed a note that the installed philosophy plugin's board.py was not found, so ROUTE_TABLE_MIRROR was not checked in this run. Acceptance criteria are left unchecked for the reviewer.
<!-- SECTION:NOTES:END -->
