---
id: DRAFT-14
title: CartCleared can name an item that is still in-cart
status: Draft
assignee: []
created_date: '2026-10-21 11:28'
labels: []
dependencies: []
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
- [ ] #1 A ClearCart dispatched in the same millisecond as a tick that put an item in the cart either clears that item in the store or leaves its id out of CartCleared.itemIds
- [ ] #2 An application-layer test reproduces the same-millisecond tick-then-clear sequence and asserts the store and the event agree
<!-- AC:END -->
