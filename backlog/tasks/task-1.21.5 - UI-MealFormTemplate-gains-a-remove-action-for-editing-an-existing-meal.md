---
id: TASK-1.21.5
title: 'UI: MealFormTemplate gains a remove action for editing an existing meal'
status: In Progress
assignee:
  - claude
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 23:54'
labels:
  - layer-ui
  - size-1
  - finish-moved
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
- [x] #1 MealFormTemplate shows a 'Remove meal' destructive action when editing an existing meal, and never shows it when adding a new one
- [x] #2 Storybook stories and behaviour tests cover both the add and edit/remove states
- [x] #3 Visual baselines regenerated via the visual-baselines workflow if the remove action changes rendered pixels
- [x] #4 MealFormTemplate gains a linkError prop (LabelledField already supports errorMessage) so the invalid-link result from createMeal/relinkMeal (R6 URL validation, added to TASK-1.21.1) has somewhere to surface
- [x] #5 title and submittingLabel are caller-supplied props (mirroring dateLabel/submitLabel), not hardcoded - the header always says 'Add a meal' and the busy action always says 'Adding' today, which makes the Editing story show a contradictory screen ('Add a meal' / 'Save changes' / 'Adding' together)
- [x] #6 removing disables both LabelledFields and the primary ActionBar, matching adding's existing behaviour, so a meal can't be edited or re-submitted while it's being removed
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(52 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  125 passed (125)
      Tests  1640 passed (1640)
   Start at  19:36:58
   Duration  8.68s (transform 38.35s, setup 3.48s, import 107.18s, tests 39.02s, environment 18.99s)

$ firebase emulators:exec --only firestore,auth,functions --project demo-grocs 'vitest run --project emulator'
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-grocs", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
⚠  auth: Port 9099 is not open on 127.0.0.1, could not start Authentication Emulator.
⚠  auth: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "auth": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  firestore: Port 8080 is not open on 127.0.0.1, could not start Firestore Emulator.
⚠  firestore: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "firestore": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  logging: Logging Emulator unable to start on port 4500, starting on 4501 instead.
i  emulators: Shutting down emulators.

Error: Could not start Authentication Emulator, port taken.
[ELIFECYCLE] Command failed with exit code 1.
```

## Review (close-task-1-21-5, 2026-10-24) — NOT CLOSED

Verdict: the UI work holds. Five of six criteria are met against evidence I reproduced myself and are now ticked (#1, #2, #4, #5, #6). The task cannot close, on two blockers reported by close-task, neither of them about the quality of the code.

Blocking 1 — the finish line moved uncommitted. AC#5 and AC#6 were added after this task was accepted in 5a4687f. The task carries only `layer-ui, size-1`: no `finish-moved` label and no note saying who moved the finish line or why. close-task refuses on it, and a reviewer reports that rather than committing it, since ticks are the only change a review may make to a finish line. Whoever added the two criteria commits them with the `finish-moved` label and a note. This is the same blocker TASK-49's review recorded, on the same branch and the same session — one orchestrator-level fix clears both.

Blocking 2 — AC#3 (visual baselines) is genuinely unmet, and its conditional fired. The criterion is conditional ("if the remove action changes rendered pixels"), and the condition is satisfied, so it is not a criterion that can be waved through as vacuous:
- `packages/ui/visual-baselines/` holds only `templates-meal-form--rest` and `--on-phone` (3 viewports each). The three new stories Editing, Removing and Invalid have none — 9 missing images.
- Separately, the TASK-49 TextField recolor (inkHint and disabledInk to inkMuted) changes pixels in every existing disabled-state baseline across the package.
- It cannot be satisfied locally by design: `pnpm -s --filter @grocs/ui visual` reports "407 story views checked (axe, 44 x 44, images not compared)". Baselines are Linux-only and generated solely by the `visual baselines` GitHub Actions workflow on a pushed branch. Run that workflow, review the upload, then tick #3.
- Board precedent: no task on this board is Done with an unticked criterion (checked all tasks; every unticked criterion belongs to a To Do or In Progress task). There is no convention here for closing with one criterion deferred, so the task stays In Progress rather than closing on a claim that baselines exist.

Verified independently:
- `record-check --tier full`: `pnpm check`, `pnpm typecheck` and `pnpm test` all passed (125 test files, 1640 tests). It exited 1 only at `pnpm test:emulator`, because ports 9099 and 8080 were held by another agent's emulators in this session; the emulator step never started and `check:release` and `build-storybook` never ran. Environmental, not this task, and this is a UI-only change with no emulator surface.
- `pnpm -s --filter @grocs/ui visual`: exit 0, 407 story views checked. This is the real CI accessibility gate and it is green with the three new stories present.
- The check reformatted nothing: `git status` before and after differs only by this task's own markdown file, which record-check writes.
- Read the code against each criterion rather than trusting the notes. #1: the remove Button is guarded on `onRemove`, and the Rest test asserts `queryByRole('Remove meal')` is null, so "never when adding" is actually proven, not assumed. #4: `linkError` is spread onto the link LabelledField as `errorMessage`, with tests for both the error present and the hint shown in its absence. #5: `title` and `submittingLabel` are required props with no defaults, so the hardcoded strings cannot creep back; `AddMealScreen.tsx` was updated as the sole caller. #6: both LabelledFields and the ActionBar carry `disabled={adding || removing}`.

Notes, filtered and not filed:
- AC#6's test asserts `readOnly` on the name field only, not the link field, though the code sets `disabled` on both. Partial coverage of a criterion whose code is plainly correct and symmetrical; ticked, and recorded here rather than filed.
- The follow-on defect fix recorded in the notes (ActionBar `loading={adding}` rather than `adding || removing`) is right, and the Removing test pins it: the primary action is disabled but not `aria-busy`, so "Removing" and "Saving" can no longer contradict each other on one screen.
- `apps/mobile/src/screens/AddMealScreen.tsx` is an app-layer file touched by a `layer-ui` task and was not in the plan. Necessary and explained in the commit (making the props required forces the sole caller to supply them); a departure to note, not a failure, and its real wiring is TASK-1.21.6.
- The `[readonly]` exemption added to `inactive()` in `stories.accessibility.test.tsx` loosens an accessibility check and is still in the commit. TASK-49's review already judged it correct on its own WCAG 1.4.3 grounds and confirmed it is not what fixes the contrast bug. Agreed; no action, flagged only because "fix the code, not the check" makes a loosened check worth naming in any review that touches this commit.
- Button and Chip carry the same failing disabledInk-on-disabled pair: already DRAFT-22, filed by TASK-49's review. No new draft from this review.

Scope note for the orchestrator: c8c892c is on PR #9, "Ports, providers, application: meal sync, commands and watchWeekMeals" (branch feat/meal-ports-providers-application). Neither this UI task nor TASK-49 is in that PR's title or stated scope, so the UI and accessibility work is invisible to anyone reviewing #9 by its description. Either retitle and restate #9 to cover all of it, or move the UI commit to its own PR.

Oct 24, 2026 (orchestrator): AC5 and AC6 were added after acceptance (reviewer-ui's first review round, mid-fix), hence finish-moved - already the case for this task, label was just never committed alongside the criteria. AC3 (visual baselines) remains genuinely unmet pending the GitHub Actions workflow run, next.

Oct 24, 2026 (orchestrator): visual baselines regenerated via the visual-baselines GitHub Actions workflow (run 40144061265) and reviewed as images before committing - 4 changed disabled-state baselines (TASK-49's recolor), 9 new MealFormTemplate stories (Editing/Removing/Invalid x 3 viewports). All confirmed correct by inspection: Editing shows the right title/button labels, Removing shows the primary action disabled-but-not-busy next to the Removing spinner (no more Saving contradiction), Invalid shows the red-bordered field and error message. Committed in ec5d2f1, pushed.
<!-- SECTION:NOTES:END -->
