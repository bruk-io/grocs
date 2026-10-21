---
id: TASK-1.23.5
title: 'Application: a ClearCart command clears every in-cart item in one week'
status: In Progress
assignee:
  - '@builder-application'
created_date: '2026-10-21 11:11'
updated_date: '2026-10-21 11:18'
labels:
  - layer-application
  - size-2
dependencies:
  - TASK-1.23.4
modified_files:
  - packages/application/src/commands/clear-cart.ts
  - packages/application/src/commands/clear-cart.scenario.test.ts
  - packages/application/src/commands/index.ts
  - packages/application/src/index.ts
parent_task_id: TASK-1.23
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-1.23 #3, depends on TASK-1.23.4 (core). Matches decision-13's pattern (a command, dispatched, never a direct store write) and TASK-1.23.2's shape (SetItemState) for the per-item mechanics: read the week's items (syncStore.getItems), find every one whose state is in-cart, clearFromCart each with one stamp (same clock reading, same signed-in member), and mergeItem each back - the existing per-item SyncStore port has no bulk write, so this is N transactional per-item merges, the same as N individual ticks would be. Clearing an already-empty cart is not an error - zero in-cart items means zero events, successfully.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ClearCart { kitchenId, weekId } reads the week's items, clears every in-cart one with the clock and signed-in member's stamp, merges each back through the sync store, and returns the not-signed-in error code when nobody is signed in
- [ ] #2 It returns one CartCleared event naming every cleared item's id (empty when there was nothing to clear - not an error), with a scenario test covering several in-cart items, items that are not in-cart being left alone, and the empty-cart case
- [ ] #3 It is registered in commandHandlers and its types are exported from @grocs/application
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Cites R14, R17, R18 (TASK-1's spec, doc-1).

### Order of work
1. New file packages/application/src/commands/clear-cart.ts, matching set-item-state.ts's shape:
   - export interface ClearCart { type: 'ClearCart'; kitchenId: string; weekId: string }
   - export interface CartCleared extends DomainEvent { type: 'CartCleared'; weekId: string; itemIds: readonly string[] }
   - export async function clearCart(command, ctx): auth check (not-signed-in like every other command); syncStore.getItems(kitchenId, weekId); filter to items whose state.value === 'in-cart'; for each, clearFromCart(item, { at: clock.now(), by: user.uid }) then syncStore.mergeItem(kitchenId, cleared) - one stamp shared by the whole command, read once, matching how setItemStateCommand reads the clock once; return ok([{ type: 'CartCleared', weekId: command.weekId, itemIds: [the cleared ids] }]) - zero in-cart items is not an error, it is ok([{ type: 'CartCleared', weekId, itemIds: [] }]).
2. Register ClearCart in packages/application/src/commands/index.ts's commandHandlers, alongside SetItemState.
3. Export clearCart and the ClearCart/CartCleared types from packages/application/src/index.ts, alongside setItemStateCommand's exports.
4. New file packages/application/src/commands/clear-cart.scenario.test.ts, matching set-item-state.scenario.test.ts's withItem helper pattern: needs a helper that adds several items and ticks some into the cart first. Cover: several in-cart items all get cleared and the to-buy ones are left alone (assert via store.getItems that cleared items have state.value === 'cleared' and the untouched to-buy item still has state.value === 'to-buy'); the event lists exactly the cleared item ids; clearing an empty cart (no items ticked) returns ok with an empty itemIds list, not an error; the not-signed-in error code.
5. Run vitest run --project unit packages/application and confirm it passes; run pnpm typecheck for the whole repo.

### Risks
No new port method is needed - getItems and mergeItem already exist on SyncStore and are already used by setItemStateCommand for the identical per-item pattern. clearFromCart (from TASK-1.23.4, already merged to main) takes (item, stamp) and returns the updated item; it does not check the item's current state, so this command's own filter (state.value === 'in-cart') is what keeps it from clearing a to-buy item - get that filter right, since clearFromCart itself will not catch a mistake there.

### Proof
vitest run --project unit packages/application passes with the new scenario test file; commandHandlers and the package's exports include ClearCart; pnpm typecheck is clean.
<!-- SECTION:PLAN:END -->
