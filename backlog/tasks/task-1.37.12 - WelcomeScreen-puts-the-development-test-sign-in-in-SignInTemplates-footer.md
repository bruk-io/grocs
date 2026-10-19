---
id: TASK-1.37.12
title: WelcomeScreen puts the development test sign-in in SignInTemplate's footer
status: Done
assignee:
  - '@builder-app-small'
created_date: '2026-10-19 10:57'
updated_date: '2026-10-19 14:03'
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
- [x] #1 WelcomeScreen passes the development test sign-in into SignInTemplate's footer instead of overlaying it, and the Welcome route tests pass
- [x] #2 pnpm check:release still shows the test sign-in absent from release bundles
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(508 earlier lines omitted)
```text
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/SignInTemplate.stories-CsauxLyI.js
|  3.69 kB │ gzip:   1.53 kB
|  storybook-static/assets/ItemPickerTemplate.stories-CcyRBnsx.js
|  4.34 kB │ gzip:   1.52 kB
|  storybook-static/assets/Button.stories-CAJZrr0Y.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/PreferencesTemplate.stories-BReMROY1.js
|  4.55 kB │ gzip:   1.74 kB
|  storybook-static/assets/TextField-C08YPR7o.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-CN7fxOqi.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-UPMb5zVB.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-CMWllo--.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-DNPGK3js.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-C95GlTgR.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BDxkbh4w.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-CxiZfrMq.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-BwKVSb-9.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-OG_koOoE.js
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

|  Vite ✓ built in 6.00s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a926ebd1352a11dfa/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a926ebd1352a11dfa/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review (philosophy:reviewer): closes. Diff matches plan steps 1-2 exactly; the only extra edit, removing the tokens import, is the direct consequence of step 2 dropping tokens.space[16] and is within intent. Full-tier record-check exited 0 (check, typecheck, test, test:emulator with no timeouts, check:release clean, storybook build, visual 311 views with no diffs). AC1 met: footer slot used, sibling overlay removed, Welcome route tests pass. AC2 met: check:release clean. No findings; no drafts filed.
<!-- SECTION:NOTES:END -->
