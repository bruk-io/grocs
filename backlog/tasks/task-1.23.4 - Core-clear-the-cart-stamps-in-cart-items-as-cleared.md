---
id: TASK-1.23.4
title: 'Core: clear the cart stamps in-cart items as cleared'
status: In Progress
assignee:
  - '@builder-core'
created_date: '2026-10-21 11:11'
updated_date: '2026-10-21 11:12'
labels:
  - layer-core
  - size-1
dependencies: []
modified_files:
  - packages/core/src/model/item.ts
  - packages/core/src/model/item.test.ts
  - packages/core/src/model/list.ts
  - packages/core/src/model/list.test.ts
  - packages/core/src/schema/item-doc.ts
  - packages/core/src/schema/item-doc.test.ts
  - packages/core/src/index.ts
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-1.23 #3, pulled forward like ticking (TASK-1.23.1/1.23.2) at Bruk's request: the UI already has a Clear the cart button with nothing behind it. R14: 'Clear the cart removes in-cart items from the week's list view. They remain available to the aisle and amount suggestions in R11.' So this is not a delete (R20's deleted tombstone means never reappears at all, including from suggestions) - it is a third ItemState, cleared, alongside to-buy and in-cart, using the exact same stamped-field mechanism TASK-1.23.1 already built. A cleared item stays out of the week's visible list (visibleItems) but is still a normal, non-deleted item a future R11 suggestion query can read by name.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ItemState gains a third value, cleared; isState's schema guard (item-doc.ts) accepts it; visibleItems (list.ts) excludes cleared items from the week's view, the same way it already excludes deleted ones
- [ ] #2 A new clearFromCart(item, stamp) function stamps an item's state as cleared (the same shape as setItemState, named for this specific intent); tests cover the new state end to end (schema round-trip, visibleItems hiding a cleared item while keeping a to-buy/in-cart one), with no shrink to existing test counts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/core/src/model/item.ts, change `export type ItemState = 'to-buy' | 'in-cart';` to `export type ItemState = 'to-buy' | 'in-cart' | 'cleared';`.
2. In the same file, right after setItemState, add: `export function clearFromCart(item: Item, stamp: Stamp): Item { return setItemState(item, 'cleared', stamp); }` with a one-line doc comment (R14: removed from the week's view, not deleted - it stays available to a later suggestion query by name).
3. In packages/core/src/model/list.ts's visibleItems, change the filter from `.filter((i) => i.deleted === null)` to `.filter((i) => i.deleted === null && i.state.value !== 'cleared')`.
4. In packages/core/src/schema/item-doc.ts, change `const isState = (v: unknown): v is ItemState => v === 'to-buy' || v === 'in-cart';` to also accept `'cleared'`, and update the `readField(..., 'state', isState, 'to-buy or in-cart')` error message string to name all three values.
5. In packages/core/src/index.ts, export clearFromCart alongside the existing setItemState export (find that line and add beside it).
6. Tests - add, do not replace, so no existing test count shrinks:
   - packages/core/src/model/item.test.ts (10 tests now): add a test that clearFromCart stamps the state as 'cleared' and leaves every other field untouched (mirror the existing setItemState test's shape).
   - packages/core/src/model/list.test.ts (6 tests now): add a test that visibleItems excludes a cleared item while still showing a to-buy and an in-cart one.
   - packages/core/src/schema/item-doc.test.ts (5 tests now): add a round-trip test for a cleared item (encode then decode gives back the same state), matching the existing to-buy/in-cart round-trip tests' shape.
7. Run `vitest run --project unit packages/core` and confirm it passes.

### Risks
This task alone does not wire a ClearCart command - TASK-1.23.5 (application) is a separate task, and nothing here requires it: every change in this task is purely additive (a new union member, a new unreferenced function, a widened guard, one more excluded state in a filter that currently matches nothing), so the whole repo keeps typechecking and every existing test keeps passing without TASK-1.23.5 landing first - unlike TASK-27's Kitchen change, this one never touches an existing function's required parameters.

### Proof
vitest run --project unit packages/core passes with the test counts grown as described in step 6, and ItemState/clearFromCart/isState match this plan exactly.
<!-- SECTION:PLAN:END -->
