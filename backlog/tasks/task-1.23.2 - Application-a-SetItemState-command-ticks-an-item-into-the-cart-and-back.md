---
id: TASK-1.23.2
title: 'Application: a SetItemState command ticks an item into the cart and back'
status: To Do
assignee: []
created_date: '2026-10-20 22:51'
updated_date: '2026-10-20 23:44'
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
- [ ] #1 SetItemState { kitchenId, weekId, itemId, inCart } reads the week's items, restamps the item's state with the clock and signed-in member through setItemState, and merges it into the sync store
- [ ] #2 It returns an ItemMovedToCart or ItemMovedBack event, and the error codes not-signed-in and item-not-found, each covered by a scenario test beside it (R47)
- [ ] #3 It is registered in commandHandlers and its types are exported from @grocs/application
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
<!-- SECTION:NOTES:END -->
