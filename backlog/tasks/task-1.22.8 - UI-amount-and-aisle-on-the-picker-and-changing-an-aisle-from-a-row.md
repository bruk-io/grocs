---
id: TASK-1.22.8
title: 'UI: amount and aisle on the picker, and changing an aisle from a row'
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 21:09'
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
  - packages/ui/src/molecules/ItemRow.tsx
  - packages/ui/src/molecules/ItemRow.stories.tsx
  - packages/ui/src/molecules/ItemRow.test.tsx
  - packages/ui/src/molecules/AisleChipGroup.tsx
  - packages/ui/src/molecules/AisleChipGroup.stories.tsx
  - packages/ui/src/molecules/AisleChipGroup.behaviour.test.tsx
  - packages/ui/src/atoms/aisle-option.ts
  - packages/ui/src/index.ts
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

### Review follow-up (layer review before baselines)
- Replaced ItemRow's onPress/pressLabel with a single press?: { label; onPress; expanded } prop. When present, the name+amount target is 44x44 (minHeight/minWidth tokens.size.target, alignSelf 'stretch', justifyContent 'center', gated on press being given), has its own focus ring (pressFocused local state, same pattern as removeFocused) and its own forceState route ('pressPressed' | 'pressFocus', distinct from the existing 'pressed' | 'focus' which still route to the Checkbox), aria-expanded={press.expanded}, and aria-disabled/disabled from the row's own disabled prop. The accessible label folds in amount, meal badges and "Waiting to send" (joined after press.label), since a labelled button's accessible name would otherwise hide that descendant text from a screen reader.
- Extracted the aisle chip row into a new molecule, AisleChipGroup (role="group", aria-label, one Chip per aisle, selectedId, disabled, forceState on its first chip), with its own full states (rest/pressed/focus/disabled), stories and behaviour tests. This was necessary, not cosmetic: a literal role="group" or <Pressable in ListSection.tsx itself trips the story-coverage/interactive-states check (R61), which otherwise correctly asks any file with that literal text to document pressed/focus/disabled; pulling the chip group into its own fully-stated molecule is how ServingsStepper (also role="group") already satisfies the same check.
- ListSection/GroceryListTemplate: pressing a row now requires both onPressItem and non-empty aisleOptions (canPressAisle), and never on a cart row (!item.inCart) for both the press affordance and the chip group render. Added selectedAisleId to ListItem (shared by ListSection and GroceryListTemplate's section data) so the open row's current aisle chip shows pressed; ItemRow itself still takes no aisle-specific prop.
- ItemPickerTemplate: onSelectAisle now takes string | undefined and toggles off on a second press of the selected chip, like the meal chips. The amount field submits via Enter the same way the name field does (onSubmit={onAdd}).
- Replaced the duplicated AisleOption (ListSection) and PickerAisle (ItemPickerTemplate) with one shared AisleOption, defined in packages/ui/src/atoms/aisle-option.ts and exported from packages/ui/src/index.ts (same pattern as MealTone in atoms/meal-tone.ts); ItemRowPress is also now exported from the index.
- New/changed stories only; no existing story's args changed. New: ItemRow Pressable/PressPressed/PressFocus/PressDisabled; AisleChipGroup Rest/Selected/Pressed/Focus/Disabled. ListSection.AisleOpen and GroceryListTemplate.AisleOpen now set onPressItem (required for the chip group to render at all, since it is gated on it) and selectedAisleId on the open item.

Second review follow-up: remove the row press target's aria-label (its accessible name now comes from its own visible text: name, amount, meal badges, waiting tag, as SuggestionRow does). Add a hint via accessibilityHint (native) plus aria-describedby pointing to a visually-hidden sibling Text (web); never fold the hint into the name. Give the press target's pressed tint and focus ring a radius (tokens.radius[14]) and padding (tokens.space[8]/[4]) instead of hard corners flush to the row's edge. Add pressPressed/pressFocus/pressDisabled to ITEMROW_STATES with their stories. Add a cart-row-with-openAisleItemId-set test asserting no chip group. Run build-storybook and visual before handing back.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented ItemPickerTemplate.amountValue/onAmountChange (optional TextField, shown only when amountValue !== undefined) and aisleOptions/selectedAisleId/onSelectAisle (optional Chip group, shown only when aisleOptions is non-empty); both follow the file's existing meals.length > 0 ? … : null idiom so the default story is unchanged. Added ItemRow.onPress/pressLabel: wraps only the name+meta body (not the Checkbox) in a labelled Pressable, gated on onPress being supplied, so existing ItemRow renders are byte-identical. ListSection gained aisleOptions/openAisleItemId/onPressItem/onChooseAisle: pressing a to-buy row (not a cart row) calls onPressItem(id); when that row's id matches openAisleItemId, a Chip row renders under it and calls onChooseAisle(id, aisleId). Used a Fragment per item (not a wrapping View) so rows without the new props keep the old flat DOM. GroceryListTemplate threads the same four props to each ListSection (not CartSection). Chip reuses kind="meal" with tone="neutral" for aisle selection (no new Chip kind; CHIP_STATES/Chip stories unchanged).

New stories only, no existing story args changed: ItemPickerTemplate.WithAmountAndAisle; ListSection.AisleOpen; GroceryListTemplate.AisleOpen. New behaviour tests cover: amount field value/onChange and absence when not given; aisle chips shown/selected/chosen and absence when not given; row press reporting the id and excluded on cart rows; chips open only for the matching openAisleItemId; GroceryListTemplate wiring of press and choose through to ListSection.

`pnpm exec vitest run --project ui`: Test Files 52 passed (52); Tests 1003 passed (1003).
`pnpm -s typecheck`: tsc --noEmit, clean.
`pnpm check`: checks passed (16 checks, all mode, 589 ms).

Did not generate/commit baselines (orchestrator's job via the workflow); did not run the emulator suite.

test note single line

Review follow-up (before baselines), implemented:

1. Set onPressItem on both ListSection.AisleOpen and GroceryListTemplate.AisleOpen stories; added ItemRow stories Pressable/PressPressed/PressFocus/PressDisabled.

2. ItemRow's press target is 44x44 (minHeight/minWidth tokens.size.target, alignSelf stretch, justifyContent center), gated on press being supplied so existing renders are unchanged.

3. Press target has its own focus ring (pressFocused local state, mirroring removeFocused), aria-disabled/disabled from the row's disabled prop, styles.pressTargetPressed on a real press, and its own forceState route: pressPressed/pressFocus (forceState pressed/focus still route to the Checkbox, unchanged). Stories added for all four.

4. The press target's aria-label now folds in amount, meal badges and Waiting to send after press.label, since a labelled button's accessible name otherwise hides that descendant text from a screen reader. All matching tests updated to the exact computed name.

5. aria-expanded equals press.expanded on the trigger. Extracted the chip row into a new molecule, AisleChipGroup (role group, aria-label Aisle for + name, as ServingsStepper.tsx line 28), with its own full states (rest/pressed/focus/disabled), stories and behaviour tests - necessary because a literal role=group directly in ListSection.tsx trips story-coverage/interactive-states (R61); the fix is the same shape ServingsStepper already uses, not a check change.

6. Added tests: a swiped row's press, toggle and remove each fire only their own callback (ItemRow.test.tsx); a stateful harness in ListSection.behaviour.test.tsx presses a row, sees its chips, chooses one and gets the row id and aisle id back; cart rows cannot be pressed (ListSection and GroceryListTemplate).

7. Pressing is gated on non-empty aisleOptions as well as onPressItem (canPressAisle in ListSection), with a test. Replaced ItemRow's onPress and pressLabel with one press object prop: label, onPress, expanded.

8. Replaced the duplicated AisleOption (ListSection) and PickerAisle (ItemPickerTemplate) with one shared AisleOption in packages/ui/src/atoms/aisle-option.ts, exported from packages/ui/src/index.ts, alongside the new ItemRowPress type.

Judgement calls as decided: selectedAisleId added to ListItem (shared by ListSection and GroceryListTemplate's section data), not a new prop on ItemRow. ItemPickerTemplate's onSelectAisle now takes string or undefined and toggles off on a second press, like the meal chips. Inline chips and the press affordance are both gated on the item not being in the cart. The amount field submits via onAdd on Enter, like the name field.

Final prop names for the app builder to code against:

ItemRow: press, an optional object of label (string), onPress (function) and expanded (boolean), type exported as ItemRowPress. forceState now accepts pressed, focus, pressPressed or pressFocus. No aisle-specific prop.

ListItem (organisms/ListSection.tsx, used by both ListSection and GroceryListTemplate) adds an optional selectedAisleId (string).

ListSection and GroceryListTemplate add optional aisleOptions (readonly AisleOption array), openAisleItemId (string or null), onPressItem (id to void) and onChooseAisle (id and aisleId to void). A row is pressable, and its chip group renders, only when onPressItem is given, aisleOptions is non-empty, and the item is not in the cart.

ItemPickerTemplate adds optional amountValue, onAmountChange, aisleOptions, selectedAisleId, and onSelectAisle (now id or undefined to void).

AisleOption is the new shared type in packages/ui/src/atoms/aisle-option.ts, exported from the index: id and label, both strings.

New molecule AisleChipGroup, exported from the index: label, options, optional selectedId, onSelect, disabled and forceState (pressed or focus).

Reran after the changes: vitest for the ui project: 53 test files passed, 1036 tests passed. typecheck: clean. pnpm check: 16 checks passed.

Still did not generate or commit baselines; still did not run the emulator suite.

Second review follow-up (label-content-name-mismatch before baselines):

1. Removed the row press target's aria-label; its accessible name now comes from its own visible content (name, amount, meal badges, Waiting to send), same mechanism as SuggestionRow. Added a hint via accessibilityHint (native) and aria-describedby referencing a visually-hidden sibling Text (web) carrying press.label, which is now a plain hint like Change the aisle, never folded into the name. Added a test asserting amount, meal badges and the waiting text stay in the pressable row's textContent.

2. Added a test rendering a cart row with its id in openAisleItemId and asserting no chip group (role=group) and no chip buttons appear, in both ListSection and GroceryListTemplate.

3. Gave the press target's pressed tint and focus ring a radius (tokens.radius[14]) and padding (tokens.space[8] horizontal, tokens.space[4] vertical) instead of hard corners flush to the row's edge.

4. Added pressPressed, pressFocus and pressDisabled to ITEMROW_STATES (already had matching PressPressed/PressFocus/PressDisabled stories); corrected the stories comment that called the base Pressable story 'Not a state' to describe only that one (the three variants are now declared states, not demo-only).

5. Reran: pnpm exec vitest run --project ui: 53 files, 1039 tests passed. pnpm -s typecheck: clean. pnpm check: 16 checks passed. pnpm --filter @grocs/ui build-storybook: succeeded. pnpm --filter @grocs/ui visual -- --no-build: 'visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.' then 'visual: 474 story views checked (axe, 44 x 44, images not compared)', exit code 0 - no axe violations, including no label-content-name-mismatch on the press target.
<!-- SECTION:NOTES:END -->
