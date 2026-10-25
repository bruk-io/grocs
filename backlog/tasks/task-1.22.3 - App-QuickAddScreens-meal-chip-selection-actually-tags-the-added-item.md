---
id: TASK-1.22.3
title: 'App: QuickAddScreen''s meal-chip selection actually tags the added item'
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-25 01:23'
updated_date: '2026-10-25 01:23'
labels:
  - layer-app
  - size-1
dependencies:
  - TASK-1.22.2
modified_files:
  - apps/mobile/src/screens/QuickAddScreen.tsx
  - apps/mobile/src/routes/screens.route.test.tsx
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Depends on TASK-1.22.2 (application: AddItem gains an optional mealId). QuickAddScreen already lets a member pick a meal chip (mealId state, selectedMealId/onSelectMeal wired to ItemPickerTemplate) but the selection currently does nothing - add() never includes it in the dispatched command. One-line wiring to close the loop.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Adding an item with a meal chip selected dispatches AddItem with that mealId; the resulting item shows the meal's badge on the Groceries screen
- [ ] #2 Adding with no meal selected is unchanged (no mealId in the command, item has no badges, same as today)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R10 (an item added for a meal carries that meal's badge) end to end - the UI affordance to pick a meal already exists, this closes the gap between picking it and it actually mattering.

### Order of work
1. In apps/mobile/src/screens/QuickAddScreen.tsx's `add` function (around line 39-43): change `const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: value };` to include the selected meal: `const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: value, ...(mealId ? { mealId } : {}) };`.
2. In apps/mobile/src/routes/screens.route.test.tsx's existing `describe('QuickAdd', ...)` block (around line 194), add one test: open /quick-add signed in with a kitchen that has a real meal already planned (seed one via dispatching AddMeal first, or reuse whatever pattern the file's other describe blocks already use to get a signed-in app with a kitchen - check the `appOnFakes`/`open` helpers at the top of the file for the exact setup shape), select that meal's chip, type an item name, press Add, navigate to Groceries, and assert the added item shows the meal's badge (the meal's name/tone, matching how GroceriesScreen already renders mealBadges on an item row - check GroceriesScreen.route or app.test.tsx for the exact assertion shape other item-badge tests use).
3. Run `pnpm test` (full suite, all four vitest projects - not scoped), `pnpm check`, `pnpm typecheck`.

### Risks
- None - this is a one-line change to an existing, already-tested dispatch call; the only new surface is the conditional mealId spread, mirroring the identical pattern already used for `amount`/`aisle` elsewhere in this same command family.

### Proof
- pnpm test (full suite) green, including the new badge-tagging test.
- pnpm check, pnpm typecheck green.
<!-- SECTION:PLAN:END -->
