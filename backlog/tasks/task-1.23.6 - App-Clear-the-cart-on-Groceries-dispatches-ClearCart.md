---
id: TASK-1.23.6
title: 'App: Clear the cart on Groceries dispatches ClearCart'
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-21 12:09'
updated_date: '2026-10-21 12:42'
labels:
  - size-2
  - layer-app
dependencies: []
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13, R14. Delivers the app part of TASK-1.23 #3, after TASK-1.23.4 (core) and TASK-1.23.5 (the ClearCart application command). GroceryListTemplate already takes onClearCart and CartSection shows the button when it is given. Pulled ahead of TASK-1.22 like ticking, at Bruk's request to finish what the demo can show.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Pressing Clear on In the cart dispatches ClearCart for the week and the cleared items leave Groceries, proved by a route test on the fakes
- [x] #2 The demo route test ticks a sample item, clears the cart and finds it gone
- [x] #3 A failed clear shows the screen's banner and leaves the cart as it was
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add clear() in GroceriesScreen dispatching ClearCart and pass onClearCart, banner on failure. Route tests on fakes in index.route.test.tsx, demo test in demo.route.test.tsx. Modified files: apps/mobile/src/screens/GroceriesScreen.tsx, apps/mobile/src/routes/index.route.test.tsx, apps/mobile/src/demo/demo.route.test.tsx
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done on branch (see commit). GroceriesScreen.clear() dispatches ClearCart {kitchenId, weekId} and passes onClearCart; failure sets banner 'Could not clear the cart'. #1: index.route.test.tsx 'removes the in-cart items from Groceries when Clear the cart is pressed' (fakes; Bananas leave, Apples stay). #2: demo.route.test.tsx 'clears a ticked sample item out of Groceries' (ticks Garlic, clears, gone). #3: index.route.test.tsx 'shows the banner and keeps the cart when the clear fails' (failing store). Tests advance the FakeClock between tick and clear, as a same-instant clear ties the tick stamp and does not win. pnpm check, typecheck and full pnpm test (1455 tests) pass.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(738 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-CszuBNWU.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-TkLO1_e5.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-Cjexr2JQ.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-bJuOkOKn.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BQqZig9n.js
|  17.73 kB │ gzip:   4.85 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-gUeYK-dJ.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-Cb36oWZu.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DCWVYMlP.js
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

|  Vite ✓ built in 6.57s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.4s of this 6.5s
|  build (83%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (32%, 2.1s, 824
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
|  /home/claude/grocs/.claude/worktrees/agent-a23bad45b60d413d3/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 362 story views checked (axe, 44 x 44, 362 images compared)
```

Reviewed by philosophy:reviewer at 6ebf817. Full check (record-check --tier full) exit 0, no files reformatted. #1 met: index.route.test 'removes the in-cart items...' dispatches ClearCart {kitchenId, weekId} on fakes; Bananas leave, Apples stay. #2 met: demo.route.test ticks Garlic, clears, finds it gone. #3 met: failing store test shows 'Could not clear the cart' and Bananas stays ticked. Findings: the tests advance the FakeClock 60 s between tick and clear because of the same-millisecond merge tie, the known one already placed with TASK-1.24; no new task. Low: the failure test covers one in-cart item only, so a partial failure across several items isn't exercised; the application command owns that (TASK-1.23.5), no task filed. No drafts filed.
<!-- SECTION:NOTES:END -->
