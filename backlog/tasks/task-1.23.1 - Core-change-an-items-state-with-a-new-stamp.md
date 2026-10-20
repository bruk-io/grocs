---
id: TASK-1.23.1
title: 'Core: change an item''s state with a new stamp'
status: To Do
assignee: []
created_date: '2026-10-20 22:51'
updated_date: '2026-10-20 23:01'
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
<!-- SECTION:NOTES:END -->
