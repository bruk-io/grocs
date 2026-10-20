---
id: TASK-10.9
title: The demo's Welcome leads with Try the demo as its one action
status: Done
assignee:
  - '@builder-app-small'
created_date: '2026-10-20 04:15'
updated_date: '2026-10-20 12:32'
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
- [x] #1 In the demo variant, Try the demo is Welcome's one primary action, and Continue with Google and the invite row are not shown (route test)
- [x] #2 The real build's Welcome is unchanged (its existing route tests pass unchanged), and check:release and check:demo pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/WelcomeScreen.tsx: remove the onOpenInvite={go.join} prop line from SignInTemplate, and change {...(demo ? { footer: <TryDemo demo={demo} /> } : dev ? { footer: <DevSignIn dev={dev} /> } : {})} to {...(demo ? { primaryLabel: 'Try the demo', onPrimary: () => void demo.signIn() } : { onOpenInvite: go.join, ...(dev ? { footer: <DevSignIn dev={dev} /> } : {}) })}. TASK-12 made primary mode a type-level choice, so onOpenInvite may only be passed outside it.
2. Same file: delete the TryDemo function and its doc comment. Keep the DemoAccess import (the demo prop still uses it).
3. apps/mobile/src/demo/demo.route.test.tsx, in 'opens on Welcome, with a way in that needs no account': after the existing Try the demo expectation, add expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull(); and expect(screen.queryByText('Got an invite?')).toBeNull();
4. Same file, in 'has no way in but the real ones in a build that is not the demo': add expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy(); after the existing expectation. Change no other expectation and delete no test.
5. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 20, 2026 (orchestrator): TASK-12 merged; step 1 rewritten for its final API, which forbids onOpenInvite in primary mode.

Worker report (builder-app-small): Steps 1-4 done as written. Step 1: WelcomeScreen passes primaryLabel/onPrimary in demo mode and onOpenInvite (plus the dev footer) only outside it, matching TASK-12's primary-mode type. TryDemo removed; DemoAccess import kept. Step 3 added the two demo-variant negative expectations; step 4 added the Continue with Google positive expectation. No other expectation changed, no test deleted. Checks: pnpm test 100 files / 1331 tests passed; pnpm typecheck clean; pnpm check passed (13 checks); pnpm check:release clean (2 bundles, 9 patterns); pnpm check:demo clean (2 bundles, 5 barred patterns). No step needed to stop.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(683 earlier lines omitted)
```text
|  storybook-static/assets/ItemRow-D4rogVGR.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-DT2E49m-.js
|  5.75 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-5YEl73Jj.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-Cu--Utzi.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-Bv4azUGw.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-jjCZAg1S.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-DbzRAt0n.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CMbDcjBB.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-HGbYrCHh.js
|  1,359.38 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 11.67s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 7.7s of this 11.6s
|  build (66%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (33%, 3.8s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (23%, 2.7s, 822
|  calls)
|  - plugin treat-js-files-as-jsx transform (12%, 1.4s, 822 calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a9ea367cfa1aa0214/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 315 story views checked (axe, 44 x 44, 315 images compared)
```

Review (philosophy:reviewer): closed. Commit 7d08dfd does plan steps 1-4 exactly as written: demo passes primaryLabel/onPrimary, onOpenInvite and dev footer only outside primary mode, TryDemo removed; route tests gained three expectations, none changed or removed; the non-demo Welcome test and branch are unchanged. Full tier (incl. test:emulator, check:release, visual) exited 0; pnpm check:demo run separately exited 0 (2 bundles, 5 barred patterns), since the full tier does not include it. AC #1 met by the demo route test; AC #2 met by the unchanged real-build route test plus both bundle checks. Finding (low, not filed): WelcomeScreen's doc comment (line 9) still says Continue with Google and the invite link do nothing; in the demo they are no longer shown, so the comment should say that applies only outside the demo. Fold into the next touch of that file.
<!-- SECTION:NOTES:END -->
