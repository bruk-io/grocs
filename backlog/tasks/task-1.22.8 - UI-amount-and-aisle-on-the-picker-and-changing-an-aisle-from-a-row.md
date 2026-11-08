---
id: TASK-1.22.8
title: 'UI: amount and aisle on the picker, and changing an aisle from a row'
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 20:29'
labels:
  - layer-ui
  - size-3
dependencies: []
modified_files:
  - packages/ui/src/templates/ItemPickerTemplate.tsx
  - packages/ui/src/templates/ItemPickerTemplate.stories.tsx
  - packages/ui/src/templates/ItemPickerTemplate.behaviour.test.tsx
  - packages/ui/src/organisms/ListSection.tsx
  - packages/ui/src/organisms/ListSection.stories.tsx
  - packages/ui/src/organisms/ListSection.behaviour.test.tsx
  - packages/ui/src/templates/GroceryListTemplate.tsx
  - packages/ui/src/templates/GroceryListTemplate.stories.tsx
  - packages/ui/src/templates/GroceryListTemplate.behaviour.test.tsx
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11, R38. See TASK-1.22's slice contract. Baselines come from the workflow afterwards; the orchestrator does that.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ItemPickerTemplate shows an optional amount field and aisle chips, with stories and behaviour tests
- [ ] #2 Pressing a to-buy row shows aisle chips inline, choosing one calls back with the row and aisle, with stories and behaviour tests
- [ ] #3 ui takes aisle options as data and does not import core
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. ItemPickerTemplate: add optional `amountValue`/`onAmountChange` (TextField, rendered only when `amountValue !== undefined`) and an optional aisle chip group (`aisleOptions: readonly {id,label}[]`, `selectedAisleId`, `onSelectAisle`), rendered only when `aisleOptions` is given and non-empty, following the existing `meals.length > 0 ? … : null` idiom so the default-args story is byte-identical.
2. ListSection: add optional `aisleOptions`, `openAisleItemId`, `onPressItem`, `onChooseAisle` props. When `onPressItem` is given, wrap only the row's name/meta body (not the Checkbox) in a labelled Pressable ("Change the aisle for {name}") that calls `onPressItem(id)`; when `openAisleItemId === item.id` and `aisleOptions` is given, render a Chip group under that row that calls `onChooseAisle(item.id, aisleId)`. All new behaviour is gated on the new props being present so existing renders are unchanged.
3. GroceryListTemplate: thread the same four props down to each ListSection it renders (not CartSection, which has no to-buy rows).
4. Chip: reuse `kind: 'meal'` with a neutral tone for aisle chips (no new kind), since quickAdd's plus icon is wrong for a selection chip; CHIP_STATES and existing Chip stories stay unchanged.
5. New stories only (no change to existing story args): ItemPickerTemplate story with amount + aisle chips; ListSection/GroceryListTemplate story with a row's aisle chips open. New behaviour tests for each: picker amount + aisle selection; row press opens chips; choosing a chip calls back with (itemId, aisleId).
6. Run vitest (ui project), pnpm check, pnpm typecheck; fix findings; commit.

### Risks
- Nesting a Pressable inside ItemRow's existing structure could make `getByRole('button')` queries ambiguous with the Remove button or create accessibility-tree oddities; mitigated by a distinct, explicit aria-label and by not wrapping the Checkbox.
- Any new prop rendering unconditionally (e.g. an always-present wrapper View) could shift existing story layouts and fail the visual baseline comparison the orchestrator runs later; mitigated by gating all new markup on the new props being supplied.
- "Which row is open" is kept as a controlled prop (`openAisleItemId`), not internal `useState`, so the open state is representable as a static story/screenshot and stays data-in/callback-out per R26/R38.

### Proof
- `pnpm exec vitest run --project ui`
- `pnpm check`
- `pnpm typecheck`
- New behaviour tests assert: ItemPickerTemplate shows an amount field and aisle chips and reports changes to both; a to-buy row's press reveals aisle chips and choosing one calls back with (itemId, aisleId); existing ItemPickerTemplate/ListSection/GroceryListTemplate behaviour tests continue to pass unmodified (proving existing stories/baselines are untouched).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented ItemPickerTemplate.amountValue/onAmountChange (optional TextField, shown only when amountValue !== undefined) and aisleOptions/selectedAisleId/onSelectAisle (optional Chip group, shown only when aisleOptions is non-empty); both follow the file's existing meals.length > 0 ? … : null idiom so the default story is unchanged. Added ItemRow.onPress/pressLabel: wraps only the name+meta body (not the Checkbox) in a labelled Pressable, gated on onPress being supplied, so existing ItemRow renders are byte-identical. ListSection gained aisleOptions/openAisleItemId/onPressItem/onChooseAisle: pressing a to-buy row (not a cart row) calls onPressItem(id); when that row's id matches openAisleItemId, a Chip row renders under it and calls onChooseAisle(id, aisleId). Used a Fragment per item (not a wrapping View) so rows without the new props keep the old flat DOM. GroceryListTemplate threads the same four props to each ListSection (not CartSection). Chip reuses kind="meal" with tone="neutral" for aisle selection (no new Chip kind; CHIP_STATES/Chip stories unchanged).

New stories only, no existing story args changed: ItemPickerTemplate.WithAmountAndAisle; ListSection.AisleOpen; GroceryListTemplate.AisleOpen. New behaviour tests cover: amount field value/onChange and absence when not given; aisle chips shown/selected/chosen and absence when not given; row press reporting the id and excluded on cart rows; chips open only for the matching openAisleItemId; GroceryListTemplate wiring of press and choose through to ListSection.

`pnpm exec vitest run --project ui`: Test Files 52 passed (52); Tests 1003 passed (1003).
`pnpm -s typecheck`: tsc --noEmit, clean.
`pnpm check`: checks passed (16 checks, all mode, 589 ms).

Did not generate/commit baselines (orchestrator's job via the workflow); did not run the emulator suite.
<!-- SECTION:NOTES:END -->
