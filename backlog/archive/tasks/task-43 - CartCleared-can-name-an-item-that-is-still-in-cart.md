---
id: TASK-43
title: CartCleared can name an item that is still in-cart
status: Done
assignee:
  - '@bruk.habtu@gmail.com'
created_date: '2026-10-21 11:28'
updated_date: '2026-10-22 19:14'
labels:
  - size-2
  - layer-application
dependencies: []
modified_files:
  - packages/application/src/commands/clear-cart.ts
  - packages/application/src/commands/clear-cart.scenario.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-1.23.5. clearCart (packages/application/src/commands/clear-cart.ts) reads the clock once and stamps every cleared item with that one stamp, then pushes the id into CartCleared.itemIds after mergeItem. When an item was ticked into the cart at the same millisecond value as the clear, mergeItem's field-level LWW keeps the in-cart value, so the store still shows in-cart while the event claims the item was cleared.

Evidence, from packages/core/src/merge/lww.ts: same at and same by falls through to JSON.stringify(a.value) >= JSON.stringify(b.value), and '"cleared"' < '"in-cart"' bytewise, so in-cart wins deterministically. Same at with a different by resolves on uid order in compareStamps, so any ticker whose uid sorts above the clearer's also wins.

The reachable path is local and sequential, not a two-phone coincidence: the tick must already be in the store for getItems to report it as in-cart, so a client that dispatches SetItemState(inCart: true) and ClearCart within the same millisecond (same event-loop turn) hits this every time, not probabilistically. No acceptance criterion on TASK-1.23.5 covered it and the single shared stamp is what that task's plan specified, so it did not block the close.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A ClearCart dispatched in the same millisecond as a tick that put an item in the cart either clears that item in the store or leaves its id out of CartCleared.itemIds
- [x] #2 An application-layer test reproduces the same-millisecond tick-then-clear sequence and asserts the store and the event agree
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In clearCart (packages/application/src/commands/clear-cart.ts), after merging every cleared item, re-fetch the week's items from syncStore and only report the ids that actually ended up state.value === 'cleared' in CartCleared.itemIds. A concurrent tick stamped at the same instant as the clear can win the field-level LWW tie-break (R18, lww.ts compareStamps/mergeStamped), so the event must reflect what the store actually holds rather than what the command intended.
2. Add a reproduction test to clear-cart.scenario.test.ts: two clients sharing one InMemorySyncStore, 'sam' ticks an item into the cart and 'bruk' clears the cart with both clocks set to the identical millisecond. Because compareStamps breaks a same-`at` tie on `by` ('bruk' < 'sam' alphabetically), the stored in-cart stamp sorts later and the merge keeps the item in-cart. Assert the item is still in-cart in the store, and that CartCleared.itemIds does not include it.
3. Run the full existing clear-cart.scenario.test.ts suite to confirm the other three scenarios (normal clear, stamping, empty cart) are unaffected by the extra getItems round trip.

### Risks
- The fix adds one extra getItems call per ClearCart dispatch, always, even when there's no race. This is the same pattern TASK-1.23.5 already uses (read-then-write), and ClearCart is not called in a hot loop, so the cost is acceptable.
- Only application-layer code changes; no port or provider signature changes, so no cross-layer blast radius.

### Proof
pnpm --filter @grocs/application test (clear-cart.scenario.test.ts green, including the new reproduction case), then pnpm check && pnpm typecheck && pnpm test clean across the repo.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed in clear-cart.ts: after merging every cleared item, re-fetch the week's items and filter CartCleared.itemIds to ids that actually ended up state.value === 'cleared'. Reproduced the race with a new scenario test (sam ticks, bruk clears, same millisecond, sam's uid sorts above bruk's so the LWW tie keeps in-cart): confirmed the test fails without the fix (itemIds wrongly included the still-in-cart id) and passes with it. Full suite green: pnpm check (14), pnpm typecheck, pnpm test (117 files / 1544 tests).

Repro at 3a050ef97e9c, test files: packages/application/src/commands/clear-cart.scenario.test.ts; command: `npx vitest run --project unit packages/application/src/commands/clear-cart.scenario.test.ts -t DRAFT-14` exited 1

```text

 RUN  v4.1.12 /Users/brukhabtu/src/github.com/bruk-io/grocs

 ❯ |unit| packages/application/src/commands/clear-cart.scenario.test.ts (5 tests | 1 failed | 4 skipped) 6ms
     × leaves an item still in-cart out of itemIds when a same-instant tick wins the merge (DRAFT-14) 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/application/src/commands/clear-cart.scenario.test.ts > ClearCart scenarios (R47) > leaves an item still in-cart out of itemIds when a same-instant tick wins the merge (DRAFT-14)
AssertionError: expected { ok: true, value: [ { …(3) } ] } to deeply equal { ok: true, value: [ { …(3) } ] }

- Expected
+ Received

  {
    "ok": true,
    "value": [
      {
-       "itemIds": [],
+       "itemIds": [
+         "bruk-2",
+       ],
        "type": "CartCleared",
        "weekId": "2026-W42",
      },
    ],
  }

 ❯ packages/application/src/commands/clear-cart.scenario.test.ts:81:20
     79|     const result = await bruk.dispatcher.dispatch(clear());
     80|
     81|     expect(result).toEqual({ ok: true, value: [{ type: 'CartCleared', …
       |                    ^
     82|     const [after] = await store.getItems(KITCHEN, WEEK);
     83|     expect(after?.state.value).toBe('in-cart');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 skipped (5)
   Start at  00:56:07
   Duration  145ms (transform 56ms, setup 0ms, import 72ms, tests 6ms, environment 0ms)
```

Repro at 57c0d0638144, test files: packages/application/src/commands/clear-cart.scenario.test.ts; command: `npx vitest run --project unit packages/application/src/commands/clear-cart.scenario.test.ts -t 'one client ticks and clears'` exited 1

```text

 RUN  v4.1.12 /Users/brukhabtu/src/github.com/bruk-io/grocs

 ❯ |unit| packages/application/src/commands/clear-cart.scenario.test.ts (6 tests | 1 failed | 5 skipped) 6ms
     × leaves an item still in-cart out of itemIds when one client ticks and clears in the same millisecond (DRAFT-14) 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/application/src/commands/clear-cart.scenario.test.ts > ClearCart scenarios (R47) > leaves an item still in-cart out of itemIds when one client ticks and clears in the same millisecond (DRAFT-14)
AssertionError: expected { ok: true, value: [ { …(3) } ] } to deeply equal { ok: true, value: [ { …(3) } ] }

- Expected
+ Received

  {
    "ok": true,
    "value": [
      {
-       "itemIds": [],
+       "itemIds": [
+         "bruk-2",
+       ],
        "type": "CartCleared",
        "weekId": "2026-W42",
      },
    ],
  }

 ❯ packages/application/src/commands/clear-cart.scenario.test.ts:96:20
     94|     const result = await client.dispatcher.dispatch(clear());
     95|
     96|     expect(result).toEqual({ ok: true, value: [{ type: 'CartCleared', …
       |                    ^
     97|     const [after] = await store.getItems(KITCHEN, WEEK);
     98|     expect(after?.state.value).toBe('in-cart');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 5 skipped (6)
   Start at  01:01:36
   Duration  150ms (transform 59ms, setup 0ms, import 76ms, tests 6ms, environment 0ms)
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(670 earlier lines omitted)
```text
│  3.40 kB │ gzip:   1.44 kB
│  storybook-static/assets/SignInTemplate.stories-DBkdVTQR.js
│  3.43 kB │ gzip:   1.58 kB
│  storybook-static/assets/MealRail-C2i_9oP0.js
│  3.75 kB │ gzip:   1.48 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BWlu7lEy.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-BSFNWHMM.js
│  4.47 kB │ gzip:   1.30 kB
│  storybook-static/assets/TextField-BAkH_EYj.js
│  4.64 kB │ gzip:   1.78 kB
│  storybook-static/assets/PreferencesTemplate.stories-DPGsyaaw.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/ItemRow-llxbSZd0.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-BgtS2tHB.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-D727agKQ.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-C9NlIACf.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-D_9tsqTo.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-BQPooMS0.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-C4IE0SAU.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-BY4K-uQi.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DKAbW5-C.js
│  1,360.62 kB │ gzip: 392.03 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.16s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 398 story views checked (axe, 44 x 44, images not compared)
```

Both acceptance criteria met. Fix (clear-cart.ts) re-fetches after merging and filters CartCleared.itemIds to ids that actually ended up cleared, closing the race where a same-instant tick could win the LWW tie-break and leave an item in-cart while the event still named it. Reproduced and confirmed both tie-break paths described in the bug report: the two-client different-by race and the single-client same-at-same-by race (JSON value tie-break). Verified independently: reverted just the fix and confirmed the regression tests fail the way the bug predicts; restored the fix and confirmed they pass. Full verification chain green: pnpm check, typecheck, test, test:emulator, check:release, and the UI package's storybook build/visual check (unaffected, as expected for an application-layer-only change).
<!-- SECTION:NOTES:END -->
