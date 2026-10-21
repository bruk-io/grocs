---
id: TASK-1.23.3
title: 'App: ticking on Groceries dispatches SetItemState'
status: To Do
assignee: []
created_date: '2026-10-20 22:51'
updated_date: '2026-10-21 00:33'
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
- [ ] #1 Ticking an item on Groceries moves it to In the cart and unticking moves it back, proved by a route test on the fakes
- [ ] #2 The demo route test ticks a sample item and finds it in the cart
- [ ] #3 A failed tick shows the screen's banner and leaves the item where it was
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
<!-- SECTION:NOTES:END -->
