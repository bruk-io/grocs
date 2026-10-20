---
id: TASK-1.20.4
title: Kitchen setup shows the invite card unsent until the kitchen exists
status: In Progress
assignee:
  - '@builder-app-small'
created_date: '2026-10-20 12:42'
updated_date: '2026-10-20 19:04'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-19
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-17 (its criterion 2) so the clipboard seam could merge for TASK-1.28. Once TASK-19 gives InviteCard and KitchenSetupTemplate an unsent state, KitchenSetupScreen uses it before CreateKitchen runs, so Share link and Copy code are disabled rather than dead. Numbered steps are written once TASK-19's API exists.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Before a kitchen exists, kitchen setup shows the invite card unsent, with Share link and Copy code disabled, shown by a route test
- [ ] #2 After Start planning the card shows the real code with both buttons live, and the existing kitchen route tests pass unchanged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/KitchenSetupScreen.tsx: delete the line inviteCode={created?.inviteCode ?? '- - - -'} and move inviteCode into the spread so the type sees each shape whole: the created branch becomes { inviteCode: created.inviteCode, inviteStatus: ..., onShare: ..., onCopy: ..., onStart: ... } (its existing entries unchanged); the empty-name branch becomes { inviteCode: null }; the last branch becomes { inviteCode: null, onStart: () => void create() }.
2. apps/mobile/src/routes/kitchen.route.test.tsx: add a test 'hides Share link and Copy code until the kitchen exists': render ROUTES with await appOnFakes({ signedIn: true, kitchen: false }) at location '/'; expect await screen.findByText('Your code appears after Start planning.'); expect screen.queryByRole('button', { name: /Share link/ }) and screen.queryByRole('button', { name: 'Copy code' }) both to be null. Change no other test.
3. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 20, 2026 (orchestrator): TASK-19 is merged; its final API is inviteCode: string | null on KitchenSetupTemplate, where null hides Share link and Copy code, shows a hint, and refuses inviteStatus, onShare and onCopy at the type level.
<!-- SECTION:NOTES:END -->
