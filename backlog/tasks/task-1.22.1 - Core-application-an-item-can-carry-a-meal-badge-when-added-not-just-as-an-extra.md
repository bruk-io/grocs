---
id: TASK-1.22.1
title: >-
  Core/application: an item can carry a meal badge when added, not just as an
  extra
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-25 01:21'
updated_date: '2026-10-25 01:24'
labels:
  - layer-core
  - size-1
dependencies:
  - TASK-1.21.6
modified_files:
  - packages/core/src/model/item.ts
  - packages/core/src/model/item.test.ts
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Scoped slice of TASK-1.22's AC1 only ('Either of us adds an item for a meal (it carries that meal's badge) or as an extra') - AC2 (aisle grouping + suggestion) and AC3 (full row display) stay on TASK-1.22 for later, not touched here. Right now the grocery list and the meal plan are two disconnected lists: createExtraItem (packages/core/src/model/item.ts) is explicitly 'no meal badge' by design, always sets badges: []; AddItem (packages/application/src/commands/add-item.ts) has no mealId field at all. QuickAddScreen already lets a member pick a meal chip when adding an item (selectedMealId/onSelectMeal, wired to the UI), but the selection currently does nothing - dispatching AddItem never includes it. This task connects that already-built UI affordance to a real effect.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 NewItemInput gains an optional badges?: readonly string[] field; createExtraItem passes it through (defaulting to []), so the no-meal case is unchanged and a meal-linked case is just the same function called with one more field
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R10 (an item can be added as an extra, or for a meal of that week, carrying that meal's badge) - this task only, not R12 (the combine prompt, TASK-1.26) or R9's aisle/amount display (TASK-1.22's remaining ACs).

### Order of work
1. In packages/core/src/model/item.ts: add `readonly badges?: readonly string[];` to NewItemInput (around line 46, alongside the existing optional `amount`/`aisle` fields), with a one-line doc comment ("Meal ids this item is for; empty when it's an extra.").
2. In createExtraItem (around line 64), change the hardcoded `badges: [],` to `badges: input.badges ?? [],`.
3. Update the function's own doc comment (currently "Make a new extra item (no meal badge), stamped with who added it and when.") to say it accepts an optional meal badge too - e.g. "Make a new item, stamped with who added it and when. No badges means an extra; one or more badges means it's for those meals." Do not rename the function - NewMealItem naming is a separate decision for whoever wires the app layer, not this task's concern.
4. In packages/core/src/model/item.test.ts, add one test: createExtraItem with `badges: ['meal-1']` produces an Item whose badges field is `['meal-1']`, and a second test confirming the existing no-badges call still produces `[]` (regression guard for the default).
5. Run `pnpm exec vitest run --project unit packages/core` and `pnpm -s typecheck` to confirm both pass.

### Risks
- Keep this additive only - no existing caller of createExtraItem passes badges today, so every existing call site's behavior is unchanged by construction (`?? []` on an absent field is `[]`, the exact previous hardcoded value).

### Proof
- pnpm exec vitest run --project unit packages/core passes, including the two new/changed tests.
- pnpm -s typecheck passes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation completed:

✅ Step 1: Added `readonly badges?: readonly string[];` field to NewItemInput with doc comment
✅ Step 2: Updated createExtraItem to use `badges: input.badges ?? []` (defaults to [] when not specified)
✅ Step 3: Updated createExtraItem's doc comment to reflect that it now accepts optional meal badges
✅ Step 4: Added two tests:
   - Test that createExtraItem with badges: ['meal-1'] produces badges: ['meal-1']
   - Regression test confirming calls without badges still produce [] 
✅ Step 5: All checks pass:
   - pnpm exec vitest run --project unit packages/core: 13 passed (13), 103 passed (103)
   - pnpm -s typecheck: passes with no errors

All work complete and verified.
<!-- SECTION:NOTES:END -->
