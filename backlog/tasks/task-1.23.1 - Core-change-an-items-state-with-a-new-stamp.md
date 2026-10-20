---
id: TASK-1.23.1
title: 'Core: change an item''s state with a new stamp'
status: Done
assignee: []
created_date: '2026-10-20 22:51'
updated_date: '2026-10-20 23:28'
labels:
  - size-1
  - layer-core
dependencies: []
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R13, R18. Delivers the core part of TASK-1.23 #1. Pulled forward on 2026-10-20 at Bruk's request: the demo APK shows tick boxes that do nothing. Ticking (TASK-1.23 #1) needs no meal or grocery-list slice, so these three tasks do not wait on TASK-1.22. #2 (both phones), #3 (clear the cart) and #4 (end-to-end on dev builds) stay with TASK-1.23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 setItemState(item, state, stamp) returns the item with only state restamped; every other field and stamp is unchanged
- [x] #2 Merging the result with the original keeps the later state, both for a tick then an untick and for a stale tick arriving after an untick, proved by unit tests
- [x] #3 setItemState is exported from @grocs/core
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. In packages/core/src/model/item.ts, below createExtraItem, add `export function setItemState(item: Item, state: ItemState, stamp: Stamp): Item` returning `{ ...item, state: stamped(state, stamp) }`, with a one-line doc comment saying only the state is restamped (R18).
2. In packages/core/src/index.ts add setItemState to the existing export from './model/item.ts'.
3. In packages/core/src/model/item.test.ts add a describe('setItemState') with three tests: (a) only state and its stamp change, every other field is the same object value; (b) mergeItem (from ../merge/item-merge.ts) of an in-cart copy stamped later with the original gives in-cart, in both argument orders; (c) an untick stamped at 3 merged with a tick stamped at 2 gives to-buy, in both orders.
4. Run pnpm test, pnpm typecheck and pnpm check from the repo root; all pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per plan steps 1 to 4 (worktree branch worktree-agent-aa410a23d4230d9b6). Changed: packages/core/src/model/item.ts (setItemState, below createExtraItem), packages/core/src/index.ts (export added to the existing ./model/item.ts line), packages/core/src/model/item.test.ts (describe 'setItemState (R18)' with three tests).

Check output (repo root):
- pnpm test: Test Files 104 passed (104), Tests 1384 passed (1384); the three setItemState tests pass (verbose run of item.test.ts: 10/10).
- pnpm typecheck: tsc --noEmit, no errors.
- pnpm check: checks passed (14 checks, all mode), exit 0.

Acceptance criteria evidence (not ticked):
- #1 setItemState returns the item with only state restamped: test 'restamps only the state; every other field is the same value' (state equals {value, stamp}; id, weekId, addedBy, createdAt, name, amount, aisle, badges, deleted are the same references; original not mutated). Passes.
- #2 merge keeps the later state: tests 'a tick merged with the original keeps the tick, in both orders' and 'a stale tick merged with a later untick keeps the untick, in both orders' (tick at 2 vs untick at 3, both argument orders, via mergeItem). Pass. The second test covers the tick-then-untick pair and the stale-tick arrival, since both are the same merge pair in opposite argument order.
- #3 exported from @grocs/core: index.ts line 6 exports setItemState; runtime check with node 24 --experimental-strip-types importing packages/core/src/index.ts gives typeof 'function' and the expected restamped state.

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

|  Vite ✓ built in 8.07s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.2s of this 8.0s
|  build (77%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (41%, 3.3s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (29%, 2.3s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-aa410a23d4230d9b6/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 326 story views checked (axe, 44 x 44, 326 images compared)
```

Reviewed by philosophy:reviewer. Closed. Full-tier check exit 0, recorded above. #1: setItemState spreads the item and restamps only state; the test checks each other field by reference and that the original is not mutated. #2: mergeItem tests in both argument orders for a tick over the original and a stale tick (at 2) against an untick (at 3). #3: exported from packages/core/src/index.ts. Change matches the plan step for step. No findings; no drafts filed.
<!-- SECTION:NOTES:END -->
