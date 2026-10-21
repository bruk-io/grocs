---
id: TASK-1.23.3
title: 'App: ticking on Groceries dispatches SetItemState'
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-20 22:51'
updated_date: '2026-10-21 00:58'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-1.23.2
modified_files:
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/routes/index.route.test.tsx
  - apps/mobile/src/demo/demo.route.test.tsx
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13. Delivers the app part of TASK-1.23 #1. Pulled forward on 2026-10-20 at Bruk's request: the demo APK shows tick boxes that do nothing. Ticking (TASK-1.23 #1) needs no meal or grocery-list slice, so these three tasks do not wait on TASK-1.22. #2 (both phones), #3 (clear the cart) and #4 (end-to-end on dev builds) stay with TASK-1.23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Ticking an item on Groceries moves it to In the cart and unticking moves it back, proved by a route test on the fakes
- [x] #2 The demo route test ticks a sample item and finds it in the cart
- [x] #3 A failed tick shows the screen's banner and leaves the item where it was
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. GroceriesScreen: add toggle(itemId, inCart) dispatching SetItemState {kitchenId, weekId, itemId, inCart}; on error set the existing problem banner ('Could not update that item'), on ok clear it; pass onToggleItem to GroceryListTemplate. The item stays put on failure because rows derive from the watched store, which a failed command does not change.
2. index.route.test.tsx: route tests on fakes - tick moves a To-buy item to the cart, untick moves it back; a failing store (mergeItem rejects) shows the banner and leaves the item in To buy.
3. demo.route.test.tsx: tick a sample item (Garlic) and find it in the cart.
4. Run pnpm check, typecheck, test; commit.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Report: GroceriesScreen now passes onToggleItem, which dispatches SetItemState {kitchenId, weekId, itemId, inCart}; a failed result sets the screen banner 'Could not update that item', a success clears it.
#1: index.route.test.tsx 'ticking' > 'moves an item into the cart when ticked and back when unticked' (fakes; passes).
#2: demo.route.test.tsx 'ticks a sample item into the cart' ticks Garlic and finds it checked in the cart (passes). The test advances the FakeClock first: the sample is stamped at clock.now(), and a tick at the identical stamp does not win the merge.
#3: index.route.test.tsx 'shows the banner and leaves the item where it was when the tick fails' (store whose mergeItem rejects after seeding; banner text shown, checkbox still unchecked in To buy).
Evidence: pnpm check (14 checks passed), pnpm typecheck clean, pnpm test 105 files / 1392 tests passed.

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

|  Vite ✓ built in 3.86s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 2.8s of this 3.8s
|  build (74%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (34%, 1.3s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (32%, 1.2s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-af03a2805f60f4c02/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 326 story views checked (axe, 44 x 44, 326 images compared)
```

Review (philosophy:reviewer): closed. Full check exit 0 (record-check above); the kitchen.route 'creating a kitchen' test did not time out in this run, so no rerun was needed. #1 and #3: index.route.test.tsx 'ticking' tests on the fakes (InMemorySyncStore, FailingStore with mergeItem rejecting) cover tick, untick, and a failed tick showing 'Could not update that item' with the item left unticked in To buy. #2: demo.route.test.tsx ticks Garlic and finds it checked. GroceriesScreen.toggle matches the plan. Disappearance claim: not reproduced. Seeding Garlic into MemorySyncStore and merging setItemState(in-cart) at the same 'at' (seed by demo-bruk, and by demo-sam; tick by demo-bruk as DEMO_MEMBER) leaves 1 item, state to-buy, still returned by visibleItems. Same-stamp ties keep to-buy because JSON '"to-buy"' sorts above '"in-cart"'; different-by ties go to the higher uid. So the item stays and the tick is lost, which is the known tie behaviour placed with TASK-1.24. Most likely the builder's findByRole(checked: true) timed out and was read as the item disappearing. No draft filed. The test's 60 s clock advance is a fair workaround and does not weaken #2.
<!-- SECTION:NOTES:END -->
