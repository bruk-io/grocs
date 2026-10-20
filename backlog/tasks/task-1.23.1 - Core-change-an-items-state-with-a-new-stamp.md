---
id: TASK-1.23.1
title: 'Core: change an item''s state with a new stamp'
status: In Progress
assignee:
  - '@builder-core-small'
created_date: '2026-10-20 22:51'
updated_date: '2026-10-20 22:55'
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
- [ ] #1 setItemState(item, state, stamp) returns the item with only state restamped; every other field and stamp is unchanged
- [ ] #2 Merging the result with the original keeps the later state, both for a tick then an untick and for a stale tick arriving after an untick, proved by unit tests
- [ ] #3 setItemState is exported from @grocs/core
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. In packages/core/src/model/item.ts, below createExtraItem, add `export function setItemState(item: Item, state: ItemState, stamp: Stamp): Item` returning `{ ...item, state: stamped(state, stamp) }`, with a one-line doc comment saying only the state is restamped (R18).
2. In packages/core/src/index.ts add setItemState to the existing export from './model/item.ts'.
3. In packages/core/src/model/item.test.ts add a describe('setItemState') with three tests: (a) only state and its stamp change, every other field is the same object value; (b) mergeItem (from ../merge/item-merge.ts) of an in-cart copy stamped later with the original gives in-cart, in both argument orders; (c) an untick stamped at 3 merged with a tick stamped at 2 gives to-buy, in both orders.
4. Run pnpm test, pnpm typecheck and pnpm check from the repo root; all pass.
<!-- SECTION:PLAN:END -->
