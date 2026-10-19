---
id: TASK-1.37.11
title: SignInTemplate takes a slot below the sign-in actions
status: Done
assignee:
  - '@builder-ui-small'
created_date: '2026-10-19 09:01'
updated_date: '2026-10-19 13:04'
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
- [x] #1 AuthSheet and SignInTemplate take an optional footer slot, rendered below the invite row inside the sheet's own layout, with a withFooter state and story
- [x] #2 The new story's baseline is approved through visual:update and every existing baseline is unchanged; pnpm check, typecheck and test pass
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

Commit: 9fc583c on worktree-agent-a93709665c6fb91bf (UI footer slot, WithFooter baselines, behaviour test). Pre-commit hook passed on the retry; its unit-tests step was not clean on the first attempt because of the same hooks.test.ts 5s timeout under load (passes alone). Acceptance criteria are left unchecked for the reviewer.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(520 earlier lines omitted)
```text
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/Button-otyr0Cop.js
|  5.51 kB │ gzip:   1.95 kB
|  storybook-static/assets/GroceryListTemplate.stories-BIqHW-Kl.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-ClyN00nQ.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-yrtNnoe3.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-DnCCJz8L.js
|  17.02 kB │ gzip:   4.60 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-B2V3tl3B.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CNjugu1B.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-Y2POnIub.js
|  1,359.27 kB │ gzip: 391.70 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 8.95s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.5s of this 8.7s
|  build (75%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (34%, 3.0s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (23%, 2.0s, 822
|  calls)
|  - plugin treat-js-files-as-jsx transform (19%, 1.6s, 822 calls)
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a93709665c6fb91bf/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a93709665c6fb91bf/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 307 story views checked (axe, 44 x 44, 307 images compared)
```

Review (philosophy:reviewer, Oct 19, 2026): closed. The diff at 9fc583c does steps 1-4 of the numbered plan as written (footer?: ReactNode on AuthSheet and SignInTemplate with the given doc comment, rendered after the invite row inside the sheet View, conditional pass-through, SIGNINTEMPLATE_STATES ['rest','withFooter'], WithFooter story, one behaviour test). Only extra: the SIGNINTEMPLATE_STATES doc comment was reworded to mention the footer; harmless. Baselines: exactly three new files (templates-sign-in--with-footer, --fold-inner, --fold-outer) and three new manifest entries; no existing hash changed, templates-sign-in--rest.png still 11d9a9a0. Looked at with-footer.png: the test sign-in sits below 'Got an invite? Open it to join' inside the sheet. Full-tier record-check exit 0 (307 story views compared, check, typecheck, test, emulator). Findings: none filed.
<!-- SECTION:NOTES:END -->
