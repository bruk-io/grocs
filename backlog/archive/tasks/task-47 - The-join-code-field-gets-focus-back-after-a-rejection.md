---
id: TASK-47
title: The join code field gets focus back after a rejection
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-20 20:31'
updated_date: '2026-10-23 01:36'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-21's criterion by the orchestrator. InviteRetryTemplate disables its field while a code is checked, which drops focus on the web (and dismisses the keyboard on a phone), so after a rejection the person has to tap the field again. The template has no way to give the field focus back.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 After a rejection the code field has focus again, shown by a behaviour test
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 2 rather than 1 on acceptance (2026-10-22): whether TextField can take focus from its parent (a forwarded ref or a prop) is not yet known.

Plan (philosophy:plan-change): TextField and LabelledField gain an optional inputRef prop (TextFieldHandle type); InviteRetryTemplate holds the ref and focuses the field in an effect when checking goes true to false. Modified files: packages/ui/src/atoms/TextField.tsx, packages/ui/src/molecules/LabelledField.tsx, packages/ui/src/templates/InviteRetryTemplate.tsx, packages/ui/src/templates/InviteRetryTemplate.behaviour.test.tsx.

Builder report (builder-ui, commit 54a5817): Done. Behaviour test 'gives the code field focus back once a check ends' (checking true then false, document.activeElement is the field). Evidence: pnpm typecheck clean; pnpm check clean; pnpm test 117 files / 1546 tests pass; pnpm --filter @grocs/ui visual: 398 views, 398 images compared, no baseline changed. App: JoinInviteScreen needs nothing new; it already passes checking={busy}, so focus returns when any check ends. Status and criteria untouched.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(758 earlier lines omitted)
```text
|  storybook-static/assets/Button-BGMEuSgN.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/GroceryListTemplate.stories-CgKFz6tg.js
|  9.35 kB │ gzip:   3.11 kB
|  storybook-static/assets/Mascot-Da6qnAy2.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-D1cOb2pB.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-Dufbo6So.js
|  18.10 kB │ gzip:   5.05 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-BPoMJdgE.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DTsEAO3b.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-JysgAYU9.js
|  1,360.62 kB │ gzip: 392.04 kB

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

|  Vite ✓ built in 7.74s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.5s of this 7.7s
|  build (84%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 2.7s, 835
|  calls)
|  Additional callback time came from the callbacks below and from
|  callbacks under 1s.
|  1 callback is listed without a time. Its calls overlapped, so the time
|  inside one call includes work from other calls. To find its cost,
|  profile the build with `node --cpu-prof`:
|  - plugin vite:css transform (2 calls)
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a551250638552c266/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 398 story views checked (axe, 44 x 44, 398 images compared)
```

Review (philosophy:reviewer): closed. AC#1 met: behaviour test 'gives the code field focus back once a check ends' asserts document.activeElement is the field after checking true->false; full check exit 0 (398 visual views, no baseline change, no files rewritten by the check). Focus API: wasChecking ref is seeded from the initial checking prop and focus only fires on a true->false transition, so no focus on first render or when checking was never true. Focus on success: kitchen/screens route tests (49) pass with no act/unmounted/focus warnings. Type is task, not bug, so no repro was recorded. Findings: none needing a task.
<!-- SECTION:NOTES:END -->
