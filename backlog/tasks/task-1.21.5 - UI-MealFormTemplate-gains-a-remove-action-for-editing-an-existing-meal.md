---
id: TASK-1.21.5
title: 'UI: MealFormTemplate gains a remove action for editing an existing meal'
status: In Progress
assignee:
  - claude
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:32'
labels:
  - layer-ui
  - size-1
dependencies:
  - TASK-1.21.1
modified_files:
  - packages/ui/src/templates/MealFormTemplate.tsx
  - packages/ui/src/templates/MealFormTemplate.stories.tsx
  - packages/ui/src/templates/MealFormTemplate.behaviour.test.tsx
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
MealFormTemplate currently has no destructive action - it only supports adding a new meal. The meal-plan slice (TASK-1.21) needs rename/relink/remove on an existing meal (AC3), reached by tapping a meal card (MealPlanTemplate's existing onOpenMeal). Depends on the ports contract (TASK-1.21.2) only to the extent of knowing the final shape being edited; mostly independent design/UI work and can start as soon as TASK-1.21.1 (core) lands.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MealFormTemplate shows a 'Remove meal' destructive action when editing an existing meal, and never shows it when adding a new one
- [ ] #2 Storybook stories and behaviour tests cover both the add and edit/remove states
- [ ] #3 Visual baselines regenerated via the visual-baselines workflow if the remove action changes rendered pixels
- [ ] #4 MealFormTemplate gains a linkError prop (LabelledField already supports errorMessage) so the invalid-link result from createMeal/relinkMeal (R6 URL validation, added to TASK-1.21.1) has somewhere to surface
- [ ] #5 title and submittingLabel are caller-supplied props (mirroring dateLabel/submitLabel), not hardcoded - the header always says 'Add a meal' and the busy action always says 'Adding' today, which makes the Editing story show a contradictory screen ('Add a meal' / 'Save changes' / 'Adding' together)
- [ ] #6 removing disables both LabelledFields and the primary ActionBar, matching adding's existing behaviour, so a meal can't be edited or re-submitted while it's being removed
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In packages/ui/src/templates/MealFormTemplate.tsx: add two optional props to MealFormTemplateProps, `onRemove?: () => void` and `removing?: boolean`, each with a one-line doc comment ("Removes this meal. Shown only when editing an existing one." / "The meal is being removed."). Destructure them in the component's parameter list (default removing = false, matching the existing `adding = false` pattern).
2. In the component body, after the two LabelledField elements (inside TaskLayout's children, so it scrolls with the form, not pinned like the primary action), add: `{onRemove ? <Button variant="secondary" stretch label="Remove meal" loading={removing} loadingLabel="Removing" onPress={onRemove} disabled={adding} /> : null}`. Import Button from '../atoms/Button.tsx' at the top of the file (new import).
3. In packages/ui/src/templates/MealFormTemplate.stories.tsx: add a new story `Editing` after `Rest`, spreading `Rest` and overriding args with `submitLabel: 'Save changes'`, `onRemove: () => undefined`. One-line doc comment above it: `/** EditMeal, with Remove meal available. */`.
4. In packages/ui/src/templates/MealFormTemplate.behaviour.test.tsx: import `Editing` alongside `Rest` from `composeStories(stories)`. Add one new test in the existing describe block: render `<Editing onRemove={onRemove} />` with `const onRemove = vi.fn()`, assert `screen.getByRole('button', { name: 'Remove meal' })` exists, click it, assert `onRemove` was called exactly once. Add a second assertion in the existing `it('shows the day being planned...')` test's Rest case (not Editing) that `screen.queryByRole('button', { name: 'Remove meal' })` is null, proving it never shows when adding.
5. Run `pnpm --filter @grocs/ui test` and `pnpm --filter @grocs/ui typecheck` (or the repo's equivalent scoped commands) to confirm both pass.
6. Run the project's visual-baselines workflow only if the new story changes any existing story's rendered pixels (it should not, since `Editing` is a new story, not a change to `Rest`) - check `pnpm -s --filter @grocs/ui visual` locally first; if it reports a new baseline needed for `Editing` alone (expected, a new story) record that in the task notes for the orchestrator to regenerate via the visual-baselines GitHub Actions workflow, never locally.

### Risks
- Keep the Remove action out of ActionBar (packages/ui/src/templates/layouts/ActionBar.tsx pins exactly one button) - it is a second, secondary action inside the scrollable content, not a replacement for the primary Add/Save action.
- Do not add a new Button variant (e.g. "danger") - reuse the existing 'secondary' variant, matching PreferencesTemplate's own Sign out button precedent (packages/ui/src/templates/PreferencesTemplate.tsx).

### Proof
- `pnpm --filter @grocs/ui test` passes, including the two new/changed behaviour-test assertions.
- `pnpm --filter @grocs/ui typecheck` passes.
- New Storybook story for Editing renders without error.

7. In packages/ui/src/templates/MealFormTemplate.tsx: add an optional `linkError?: string` prop to MealFormTemplateProps (one-line doc comment: "Shown under the link field when it fails R6 validation."). Pass it to the link LabelledField as `{...(linkError ? { errorMessage: linkError } : {})}`, mirroring how errorMessage is already used elsewhere in the UI package (e.g. InviteRetryTemplate). Add a story variant and a behaviour-test assertion that the error text renders when linkError is set and is absent when it is not.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Reviewer fixes completed (all 6 fixes implemented)

1. ✓ Parameterized title and submittingLabel
   - Added title and submittingLabel props to MealFormTemplateProps
   - Rest story: title='Add a meal', submittingLabel='Adding'
   - Editing story: title='Edit a meal', submittingLabel='Saving'
   - Replaced hardcoded SubHeader title and ActionBar loadingLabel

2. ✓ Removing disables the form
   - Added disabled={adding || removing} to both LabelledFields
   - Added disabled={adding || removing} to ActionBar
   - Created Removing story with removing=true state
   - Added behaviour test asserting fields are locked while removing

3. ✓ Declared new states in MEALFORMTEMPLATE_STATES
   - Updated from ['rest'] to ['rest', 'editing', 'removing', 'invalid']
   - Renamed WithLinkError story to Invalid (matches state naming convention)

4. ✓ Updated stale doc comments
   - File-level comment: describes add/edit/remove and validation
   - Component comment: lists all UI elements including remove button

5. ✓ Fixed vacuous test
   - Replaced invalid test with proper hint text visibility assertions
   - Rest story shows hint, Invalid story hides it

6. ✓ Noted baseline regeneration for later
   - 3+ new baseline images needed via visual-baselines workflow

Test results:
- pnpm test: 1637 passing (UI tests all pass)
- pnpm typecheck: passing
- Fixed AddMealScreen to include new required props
- All behaviour tests passing

## Defect fix: ActionBar loading state while removing

Fixed contradiction where both Remove button showed 'Removing' and primary button showed 'Saving' while removing.

Change: ActionBar loading prop now `loading={adding}` only (not `loading={adding || removing}`)
- Keeps `disabled={adding || removing}` - button still unclickable while removing
- Remove button still shows "Removing" state correctly
- Primary button shows no busy state while removing, just disabled

Updated Removing behaviour test to verify:
- Primary button is NOT aria-busy
- Primary button IS disabled
- Fields are locked

Test results:
- pnpm test: 1638 passing (all behaviour tests pass)
- pnpm typecheck: passing
<!-- SECTION:NOTES:END -->
