---
id: TASK-43
title: CartCleared can name an item that is still in-cart
status: In Progress
assignee:
  - '@bruk.habtu@gmail.com'
created_date: '2026-10-21 11:28'
updated_date: '2026-10-22 04:52'
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
<!-- SECTION:NOTES:END -->
