---
id: TASK-1.23.2
title: 'Application: a SetItemState command ticks an item into the cart and back'
status: Done
assignee:
  - '@builder-application'
created_date: '2026-10-20 22:51'
updated_date: '2026-10-21 00:21'
labels:
  - size-2
  - layer-application
dependencies:
  - TASK-1.23.1
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13, R14, R47. Delivers the application part of TASK-1.23 #1 (decision-13's pattern: the app dispatches a command, never writes the store). Pulled forward on 2026-10-20 at Bruk's request: the demo APK shows tick boxes that do nothing. Ticking (TASK-1.23 #1) needs no meal or grocery-list slice, so these three tasks do not wait on TASK-1.22. #2 (both phones), #3 (clear the cart) and #4 (end-to-end on dev builds) stay with TASK-1.23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 SetItemState { kitchenId, weekId, itemId, inCart } reads the week's items, restamps the item's state with the clock and signed-in member through setItemState, and merges it into the sync store
- [x] #2 It returns an ItemMovedToCart or ItemMovedBack event, and the error codes not-signed-in and item-not-found, each covered by a scenario test beside it (R47)
- [x] #3 It is registered in commandHandlers and its types are exported from @grocs/application
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add packages/application/src/commands/set-item-state.ts: SetItemState {kitchenId, weekId, itemId, inCart}; handler requires signed-in user (not-signed-in), reads getItems, finds item (item-not-found), restamps via core setItemState with clock.now() and uid, mergeItem; returns ItemMovedToCart or ItemMovedBack.
2. Scenario test set-item-state.scenario.test.ts beside it: tick, untick, not-signed-in, item-not-found, stamp, two members later-wins.
3. Register in commands/index.ts; export command and types from src/index.ts.
Modified files: packages/application/src/commands/set-item-state.ts, packages/application/src/commands/set-item-state.scenario.test.ts, packages/application/src/commands/index.ts, packages/application/src/index.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built SetItemState in packages/application/src/commands/set-item-state.ts (handler exported as setItemStateCommand). #1: reads getItems, finds the item, restamps state via core setItemState with clock.now() and the signed-in uid, mergeItem; scenario tests 'ticking moves...' and 'restamps only the state...' (name stamp stays bruk). #2: returns ItemMovedToCart/ItemMovedBack (tick and untick scenarios); not-signed-in and item-not-found scenarios, the latter also checks nothing changes. #3: registered as SetItemState in commands/index.ts; SetItemState, ItemMovedToCart, ItemMovedBack and setItemStateCommand exported from src/index.ts. Evidence: pnpm check passed (14 checks), pnpm typecheck clean, pnpm test 1389/1389 passed. Test note: the fake clock is fixed, so tests set the clock later than the add so the newer stamp wins.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(732 earlier lines omitted)
```text
|  storybook-static/assets/PreferencesTemplate.stories-DMm4jNL7.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-BgzP7XFR.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-Bu-n0q9_.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-CxILU1aQ.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-D4jB9WQY.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-BPDuhWkL.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-PNLDbSaq.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-CGfbGzBZ.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-vq108xyw.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DmUd5E6i.js
|  1,359.38 kB │ gzip: 391.72 kB

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

|  Vite ✓ built in 6.02s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.8s of this 5.9s
|  build (81%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 2.1s, 822
|  calls)
|  - plugin vite:css transform (28%, 1.7s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-aae11261c09d9d31f/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 326 story views checked (axe, 44 x 44, 326 images compared)
```

Reviewer: closed. Full check exit 0 (kitchen.route test did not fail this run). #1-#3 met by set-item-state.ts and its five scenario tests, registry and index exports. Same-stamp tie: mergeStamped breaks equal stamps by higher JSON, so an equal-stamp tick ('in-cart') loses to 'to-buy' while an untick wins; deterministic, and only reachable if a tap lands in the same ms as the last change by the same member, or by clock skew between phones. Does not defeat #1 (normal clocks advance); clock skew and same-instant conflicts belong with TASK-1.24. Minor: handler is named setItemStateCommand (core already exports setItemState), unlike addItem/createKitchen - no action. No drafts filed.
<!-- SECTION:NOTES:END -->
