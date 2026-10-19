---
id: TASK-1.41
title: >-
  Browser pass scans a mascot's speech bubble mid-fade, so its contrast check
  fails at random
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 11:10'
updated_date: '2026-10-19 12:12'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/storybook-browser.ts
parent_task_id: TASK-1
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found running the new visual baselines workflow (TASK-1.40, run 39241970034): axe failed color-contrast on 13 mascot stories (speaking, reacting, reduced) though the same pass on the same code passed in CI and in the sandbox. Mascot's bubble pops in, or with motion reduced fades in, and tools/storybook-browser.ts openStory waits only for fonts and two frames before axe runs, so axe can read the bubble text through partial opacity. Screenshots are unaffected because they are taken with animations disabled. A flaky check blocks CI at random and teaches people to re-run it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 openStory waits for every finite entrance animation to finish before the page is scanned or measured, with a time cap so a stuck animation fails rather than hangs
- [x] #2 The browser pass passes in CI and in the visual baselines workflow with every existing baseline unchanged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Wait in openStory, after fonts and two frames, for every animation with a finite end to finish (document.getAnimations, finished), raced against a 5 s cap that records a story error instead of hanging. Screenshots already disable animations, so no baseline should change. Proof: the browser pass locally, CI, and the visual baselines workflow.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026), commit be13e0e. Evidence: local pnpm --filter @grocs/ui visual 304 views, 304 images compared, none changed; visual baselines run 39244676209 on be13e0e passed axe on every story (the failing run 39241970034 had 13 color-contrast failures on mascot speaking/reacting/reduced) and wrote baselines byte-identical to the committed ones. CI on be13e0e: see its run.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 2

(76 earlier lines omitted)
```text
packages/application/src/commands/add-item.scenario.test.ts(106,53): error TS7006: Parameter 'items' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(106,84): error TS7006: Parameter 'i' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(120,37): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(131,40): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(140,57): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(141,37): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(147,51): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.scenario.test.ts(160,52): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/commands/add-item.ts(1,42): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/dispatch/dispatcher.test.ts(1,25): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/dispatch/dispatcher.test.ts(2,71): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/application/src/dispatch/dispatcher.ts(1,21): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/dispatch/logging-middleware.ts(1,36): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/application/src/dispatch/logging-middleware.ts(15,56): error TS7006: Parameter 'e' implicitly has an 'any' type.
packages/application/src/dispatch/types.ts(1,29): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/dispatch/types.ts(2,70): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/application/src/instrumentation/instrument.test.ts(1,56): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/application/src/instrumentation/instrument.test.ts(4,45): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/application/src/instrumentation/instrument.test.ts(44,25): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/instrumentation/instrument.test.ts(69,34): error TS7006: Parameter 'r' implicitly has an 'any' type.
packages/application/src/instrumentation/instrument.ts(1,36): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/application/src/queries/queries.test.ts(1,33): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/queries/queries.test.ts(2,71): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/application/src/queries/watch-session.ts(1,40): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/application/src/queries/watch-week.ts(1,30): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/queries/watch-week.ts(2,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/application/src/queries/watch-week.ts(3,34): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/application/src/queries/watch-week.ts(21,6): error TS7006: Parameter 'items' implicitly has an 'any' type.
packages/application/src/queries/watch-week.ts(21,84): error TS7006: Parameter 'i' implicitly has an 'any' type.
packages/application/src/testing/client.ts(3,85): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/application/src/testing/client.ts(4,32): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/ports/src/logging/port.ts(1,24): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/ports/src/sync-store/contract.ts(1,64): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/ports/src/sync-store/contract.ts(2,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/ports/src/sync-store/fake.ts(1,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/ports/src/sync-store/fake.ts(2,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/ports/src/sync-store/port.ts(1,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/providers-device/src/buffer-logger.test.ts(1,32): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-device/src/buffer-logger.ts(1,40): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-device/src/buffer-logger.ts(2,28): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-device/src/console-logger.test.ts(1,32): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-device/src/console-logger.ts(1,40): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-device/src/console-logger.ts(2,28): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-device/src/console-logger.ts(23,5): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'ConsoleSink'.
packages/providers-device/src/random-ids.test.ts(1,29): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-device/src/random-ids.ts(1,34): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-device/src/system-clock.test.ts(1,31): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-device/src/system-clock.test.ts(7,14): error TS7006: Parameter 'ms' implicitly has an 'any' type.
packages/providers-device/src/system-clock.ts(1,28): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-firebase/src/firebase-auth.emulator.test.ts(1,30): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-firebase/src/firebase-auth.ts(1,50): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-firebase/src/firestore-sync-store.emulator.test.ts(1,33): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/providers-firebase/src/firestore-sync-store.emulator.test.ts(2,35): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-firebase/src/firestore-sync-store.ts(1,51): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/providers-firebase/src/firestore-sync-store.ts(2,27): error TS2307: Cannot find module '@grocs/core' or its corresponding type declarations.
packages/providers-firebase/src/firestore-sync-store.ts(3,45): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
packages/providers-firebase/src/google-auth.emulator.test.ts(1,38): error TS2307: Cannot find module '@grocs/ports/testing' or its corresponding type declarations.
packages/providers-firebase/src/google-auth.ts(1,41): error TS2307: Cannot find module '@grocs/ports' or its corresponding type declarations.
 ELIFECYCLE  Command failed with exit code 2.
 WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(523 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-D2UedSwb.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-c4jHNhqG.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-BvNtUEyw.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CKVLZ4Pu.js
|  17.02 kB │ gzip:   4.60 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-DOWvLKto.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DxQrdXcZ.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-D8yVd90N.js
|  1,359.27 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 24.23s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 15.9s of this 23.6s
|  build (67%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (22%, 5.2s, 2 calls)
|  - plugin treat-js-files-as-jsx transform (21%, 5.0s, 822 calls)
|  - plugin storybook:react-docgen-plugin transform (20%, 4.7s, 822
|  calls)
|  - plugin flow transform (4%, 1.0s, 822 calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/review-140/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/review-140/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 304 story views checked (axe, 44 x 44, 304 images compared)
```

No repro: the failure is timing-dependent (axe scanning mid-fade on a slower runner) and was observed only in visual baselines run 39241970034 (13 mascot color-contrast failures); no deterministic test reproduces it, and Chromium is not in CI's checks job. The browser pass on CI (39244666756) and the workflow (39244676209) are the evidence.

Review (philosophy:reviewer, Oct 19 2026): closes. AC1 met: entrancesFinished waits on finite document.getAnimations() raced against a 5 s cap that records a story error (fails, not hangs); infinite animations excluded; axe scans the end state so a genuine contrast failure still fails. AC2 met: CI 39244666756 on be13e0e green, workflow 39244676209 green with artifact byte-identical to committed baselines, local visual 304/304 compared. Low, noted only: animations started after the snapshot are not awaited (none today). No unit test is acceptable here.
<!-- SECTION:NOTES:END -->
