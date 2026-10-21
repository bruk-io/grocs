---
id: TASK-1.7
title: How does the layout use the Fold's inner screen? (D2)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-21 16:00'
labels:
  - size-2
  - design
  - finish-moved
milestone: m-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-14 -
    The-Folds-inner-screen-the-list-with-a-meal-rail-D2.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D2 in doc-1: the Pixel 10 Fold's inner screen and moving between postures (R43).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Three options for the inner screen (791 x 820 dp, outer 412 x 901 dp) on the Design options page: A stretched list, B plan and list side by side, C list with a meal rail. The designer's pick: B. Waiting on Bruk to choose.

Finish moved on 2026-10-18: Bruk retired the canvas, so the criterion that the canvas shows the chosen design is dropped. The options stay viewable on the frozen design artifact (version 18, Design options page) and as boards in design/reference/. The decision records the chosen option; it is built in Storybook.

2026-10-21: Bruk chose option C (list with a meal rail) from the three boards, rendered as images, over the designer's pick of B. Recorded as decision-14 (accepted).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(737 earlier lines omitted)
```text
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-C5gLF-j_.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-nz_NcS2H.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-BXxKbH4C.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-DNMLVkV0.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BeyU00Yd.js
|  17.99 kB │ gzip:   5.00 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-2u7D0HhU.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-mBh1rsaE.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-f5cOUJnj.js
|  1,359.50 kB │ gzip: 391.76 kB

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

|  Vite ✓ built in 9.81s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 7.9s of this 9.7s
|  build (81%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:build-html transform (29%, 2.8s, 1 call)
|  - plugin vite-tsconfig-paths resolveId (29%, 2.8s, 2217 calls)
|  - plugin vite:css transform (19%, 1.9s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (16%, 1.6s, 824
|  calls)
|  - plugin treat-js-files-as-jsx transform (11%, 1.1s, 824 calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory: /home/claude/grocs/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 362 story views checked (axe, 44 x 44, 362 images compared)
```

Reviewed by philosophy:reviewer. Closed: decision-14 (accepted) records Bruk's choice of option C on Oct 21, 2026, over the designer's B, matching these notes. It answers both halves of doc-1 D2: how the inner screen is used (rail with navigation and meal filters, Groceries fills the rest) and how the layout moves between postures (width switch at 600 dp; the rail's filter survives folding, shown as a filter line with Show all on the outer screen), per R43. The 600 dp switch is marked in Consequences as chosen by the orchestrator. Full check passed. No findings filed. Minor note for TASK-1.31: Meal plan on the inner screen is left provisional by the decision itself.
<!-- SECTION:NOTES:END -->
