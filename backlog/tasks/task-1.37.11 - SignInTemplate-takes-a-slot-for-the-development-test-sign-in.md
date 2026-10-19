---
id: TASK-1.37.11
title: SignInTemplate takes a slot below the sign-in actions
status: In Progress
assignee:
  - '@builder-ui-small'
created_date: '2026-10-19 09:01'
updated_date: '2026-10-19 12:15'
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
- [ ] #1 AuthSheet and SignInTemplate take an optional footer slot, rendered below the invite row inside the sheet's own layout, with a withFooter state and story
- [ ] #2 The new story's baseline is approved through visual:update and every existing baseline is unchanged; pnpm check, typecheck and test pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. packages/ui/src/organisms/AuthSheet.tsx: import type { ReactNode } from 'react'; add to AuthSheetProps: /** Below the invite row, in the sheet's own layout. Development builds put the test sign-in here (R53). */ footer?: ReactNode; take footer in the props and render {footer ?? null} after the invite View, inside the sheet View.
2. packages/ui/src/templates/SignInTemplate.tsx: import type { ReactNode } from 'react'; add the same footer?: ReactNode prop with the same doc comment; pass it on with {...(footer ? { footer } : {})} to AuthSheet. Change SIGNINTEMPLATE_STATES to ['rest', 'withFooter'].
3. packages/ui/src/templates/SignInTemplate.stories.tsx: import { Button } from '../atoms/Button.tsx'; add export const WithFooter: Story = { args: { footer: <Button variant="text" size="s" label="Sign in as Bruk (test)" /> } };
4. packages/ui/src/templates/SignInTemplate.behaviour.test.tsx: add one test that renders SignInTemplate with that footer and finds the button by role 'button' and name 'Sign in as Bruk (test)', next to 'Continue with Google'.
5. Run pnpm --filter @grocs/ui visual:update. Only the new SignInTemplate WithFooter views may be added; if any existing baseline changes, stop and report.
6. Run pnpm check, pnpm typecheck and pnpm test. Fix anything they report inside packages/ui.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Split at acceptance (Oct 19, 2026): the draft crossed two layers. This task is the ui half; TASK-1.37.12 moves WelcomeScreen onto the slot and carries the check:release criterion.

Steps 1-4 done by @builder-ui-small: AuthSheet and SignInTemplate take an optional footer slot below the invite row; SIGNINTEMPLATE_STATES is ['rest', 'withFooter']; WithFooter story added; behaviour test added. Step 5 NOT run: this worktree has no node_modules (pnpm visual:update fails with 'storybook not found'; the main checkout has one). Installing deps or borrowing another checkout's install is outside this layer's allowed commands, so steps 5 and 6 are blocked until the worktree has dependencies installed. Task stays In Progress.

Update (Oct 19, 2026, @builder-ui-small): steps 5 and 6 done after the coordinator installed dependencies in this worktree. Step 5: pnpm --filter @grocs/ui visual:update wrote 3 new WithFooter baselines (templates-sign-in--with-footer.png, --fold-inner.png, --fold-outer.png) and the manifest gained only their entries; the existing templates-sign-in--rest.png hash is unchanged, and no other existing baseline changed. Looked at the images: the test sign-in sits below the invite row inside the sheet. Step 6: pnpm -s typecheck passed; pnpm check passed (13 checks); pnpm test had one failure, tools/hooks/hooks.test.ts 'allows the orchestrator writing the board...' timing out at 5s under load; the same file passes 21/21 when run alone, and all ui tests passed. The earlier 'Step 5 NOT run' note above is superseded.
<!-- SECTION:NOTES:END -->
