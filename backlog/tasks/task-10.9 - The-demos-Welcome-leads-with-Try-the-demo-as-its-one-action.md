---
id: TASK-10.9
title: The demo's Welcome leads with Try the demo as its one action
status: To Do
assignee: []
created_date: '2026-10-20 04:15'
updated_date: '2026-10-20 04:15'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-12
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The app half of DRAFT-7, split at acceptance (TASK-12 is the ui half). TASK-12 gave AuthSheet and SignInTemplate optional primaryLabel and onPrimary: with a label set, one full-width primary button replaces Continue with Google and the invite row. The demo uses it, so a friend's first tap is the way in. Also removes the inert TryDemo component the TASK-10.3 review found in the real bundle.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 In the demo variant, Try the demo is Welcome's one primary action, and Continue with Google and the invite row are not shown (route test)
- [ ] #2 The real build's Welcome is unchanged (its existing route tests pass unchanged), and check:release and check:demo pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/WelcomeScreen.tsx: in the SignInTemplate props, change {...(demo ? { footer: <TryDemo demo={demo} /> } : dev ? { footer: <DevSignIn dev={dev} /> } : {})} to {...(demo ? { primaryLabel: 'Try the demo', onPrimary: () => void demo.signIn() } : dev ? { footer: <DevSignIn dev={dev} /> } : {})}.
2. Same file: delete the TryDemo function and its doc comment. Keep the DemoAccess import (the demo prop still uses it).
3. apps/mobile/src/demo/demo.route.test.tsx, in 'opens on Welcome, with a way in that needs no account': after the existing Try the demo expectation, add expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull(); and expect(screen.queryByText('Got an invite?')).toBeNull();
4. Same file, in 'has no way in but the real ones in a build that is not the demo': add expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy(); after the existing expectation. Change no other expectation and delete no test.
5. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->
