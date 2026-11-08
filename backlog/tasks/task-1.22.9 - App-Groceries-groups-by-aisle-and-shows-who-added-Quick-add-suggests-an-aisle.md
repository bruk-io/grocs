---
id: TASK-1.22.9
title: >-
  App: Groceries groups by aisle and shows who added; Quick add suggests an
  aisle
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 21:41'
labels:
  - layer-app
  - size-3
dependencies:
  - TASK-1.22.7
  - TASK-1.22.6
  - TASK-1.22.8
  - TASK-1.22.4
modified_files:
  - apps/mobile/src/composition/compose-app.ts
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/screens/QuickAddScreen.tsx
  - apps/mobile/src/sample/sample-data.ts
  - apps/mobile/src/demo/compose-demo.ts
  - apps/mobile/src/routes/screens.route.test.tsx
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Groceries groups items to buy under their aisle, including with a meal filter on, by route test
- [ ] #2 A row shows who added it by name from the kitchen's members, by route test
- [ ] #3 Choosing an aisle from a row moves the item for this and later adds of that name, by route test
- [ ] #4 Quick add takes an amount, and suggests an aisle that a person's own choice is not overwritten by, by route test
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. App facade: add suggestAisle(kitchenId, name) to compose-app.ts (done first, both screens need it).
2. GroceriesScreen: build sections with core's groupByAisle over to-buy items (kept under a meal filter too), map aisle id to an icon by an explicit lookup (never a cast), pass addedBy as the member's name from KitchenInfo by uid (undefined while loading or for an unknown uid), add selectedAisleId via aisleSection(item.aisle), wire aisleOptions/openAisleItemId/onPressItem/onChooseAisle (press toggles open/close; choosing dispatches SetItemAisle and closes), fix the stale doc comment.
3. QuickAddScreen: add an amount field and an aisle chip group wired to ItemPickerTemplate's new props; call app.suggestAisle as the name changes, guarded against a stale (out-of-order) answer and never overwriting a choice the person already made (including explicitly clearing it).
4. Demo: give apps/mobile/src/sample/sample-data.ts's produce/meat sample items an aisle field and apps/mobile/src/demo/compose-demo.ts pass it through to createExtraItem.
5. Tests: route tests for grouping with and without a meal filter (R9/R11), who-added by member name, choosing an aisle from a row (R18), quick add's amount+aisle and the R14 cleared-item-still-suggests case if not already proven at this layer's seam.
6. Run vitest --project app, pnpm check, pnpm typecheck; fix; record output in notes.

### Risks
- Debounced/guarded suggestAisle in QuickAddScreen: a race between two keystrokes' lookups must not let an older one win; using a request-sequence ref, not a timer, to keep this deterministic under vitest without fake timers.
- aisleSection(item.aisle) as selectedAisleId must show 'Other' selected for an aisle value outside AISLES, not leave it unselected.
- Existing route tests may assume a single 'This week' to-buy section; updating only what truly changed (R57: no shrinking/deleting tests).
- Must not cast AisleId to IconName; building an explicit id->icon map instead, with 'other' routed to 'cart'.

### Proof
pnpm exec vitest run --project app covering: aisle grouping (meal filter on and off), who-added by name (loading/unknown-uid cases), choosing an aisle closes the row and persists via SetItemAisle, quick add amount+aisle dispatch, and the R14 cleared-item-still-suggests case. pnpm check and pnpm typecheck clean.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation complete. compose-app.ts: added App.suggestAisle(kitchenId, name), wired through the same instrumented 'session' deps as getKitchenInfo/findMyKitchen, so a rejected aisleFor still logs (added a compose-app.test.tsx case covering that). GroceriesScreen.tsx: builds GrocerySection[] with core's groupByAisle over to-buy items (kept under a meal filter — only which items are grouped narrows), maps AisleId to IconName via an explicit lookup table (never a cast; 'other' -> 'cart'), passes addedBy as the member's name from KitchenInfo by uid (undefined while loading or for an unknown uid), sets selectedAisleId via aisleSection(item.aisle) so a stored out-of-list aisle shows Other selected, and wires aisleOptions/openAisleItemId/onPressItem (toggles open/closed)/onChooseAisle (dispatches SetItemAisle, closes the row). Fixed the stale doc comment. QuickAddScreen.tsx: added amount and an aisle chip group; suggestAisle is called as the name changes, guarded with a request-sequence ref against a stale answer, and a ref set on any onSelectAisle call (including undefined) means a person's own choice is never overwritten by a later suggestion. apps/mobile/src/sample/sample-data.ts and apps/mobile/src/demo/compose-demo.ts: demo produce/meat items now carry an aisle, passed through to createExtraItem.

Updated existing tests whose behaviour genuinely changed (rows are now pressable, so a plain-text meal-name match in the rail is ambiguous; Groceries' to-buy section title is now the aisle label, not literally 'This week'): apps/mobile/src/routes/index.route.test.tsx, apps/mobile/src/routes/groceries-rail.route.test.tsx, apps/mobile/src/demo/demo.route.test.tsx. No test was deleted or shrunk (R57).

New route tests in apps/mobile/src/routes/screens.route.test.tsx: grouping by aisle kept under a meal filter (AC1), who-added by member name incl. loading/unknown-uid (AC2), choosing an aisle from a row moves the item and closes the row, pressing the open row again closes it without choosing (AC3), quick add with amount+aisle (AC4), suggestAisle applying and a person's choice never being overwritten by a later suggestion (AC4, R14), and a cleared item's aisle still being suggested (R14).

Check output:
- pnpm exec vitest run --project app --project tools: 45 files, 451 tests passed.
- pnpm -s typecheck: clean.
- pnpm check: 16 checks passed.
<!-- SECTION:NOTES:END -->
