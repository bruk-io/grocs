---
id: TASK-1.37.2
title: Molecules from the design reference
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 06:13'
labels:
  - size-5
  - layer-ui
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.1
  - TASK-1.37.6
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every molecule on design/reference/DS-Molecules.dc.html as a ui component built from the atoms, except the Mascot, which is TASK-1.30. Compare with design/reference/shots/DS-Molecules.png. Cites R39, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every molecule on the DS-Molecules board except the Mascot is a component in packages/ui/src/molecules built from atoms and tokens only, and the task notes map each board molecule to its component (R60)
- [ ] #2 Each molecule has a story for every state it declares (R61, R63)
- [ ] #3 Rendered with pnpm --filter @grocs/ui shots, the molecule stories match DS-Molecules.png; any difference is listed in the notes with its reason
- [ ] #4 DS-Molecules.dc.html and its shot are deleted once the Mascot (TASK-1.30) is also built (R66)
- [ ] #5 Every story renders accessibly, every callback and state prop has a behaviour test that drives it by role and label, and the browser pass is clean, with each story's baseline approved and committed (decision-11 levels 1 to 3; R50, R65)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rework ItemRow to the board (card, avatar, done, swiped, loading) keeping its current props working for ListScreen.
2. Add 16 molecules in packages/ui/src/molecules, each with a states list and stories: AddBar, LabelledField, SectionHeader, ProgressBar, MealCard, MealEmpty, AvatarStack, Toast, ServingsStepper, TabItem, SuggestionRow, WeekNav, StatusBanner, StatusRow, InviteSummary, DayMeal (tile.day + meal).
3. Small atom changes the board needs: TextField gets placeholder and a soft action button (Paste); Avatar gets an xl size and a chartreuse small tone.
4. Behaviour tests (userEvent, by role and name) beside every component with a callback or state prop; export from index.ts.
5. Run vitest --project ui, typecheck, build-storybook, shots; compare each story with DS-Molecules.png; visual:update and inspect baselines; then visual.
6. Delete design/reference/DS-Molecules.dc.html, its shot and canvas.json entry (Mascot already built). Merge main, record notes, commit.
Risks: the interactive-states check treats any role= as interactive; reference-built only fires when all board names are built, so deleting the board is by hand. Proof: pnpm check, typecheck, vitest ui, visual.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: Bruk asked for the right level of testing in the UI build. The component-test criterion is replaced by decision-11's levels (render and accessibility, behaviour, browser pass with axe and visual baselines), and the task now waits on the harness, TASK-1.37.6.

Started 2026-10-19 01:2x while TASK-1.37.1 (a dependency) is not yet formally closed: its review ticked every criterion and the work is merged, but the reviewer's close-task run was blocked by the workspace's permission check, so the close waits on Bruk.

## Report (builder-ui)

Every molecule on DS-Molecules except the Mascot (TASK-1.30) is a component in packages/ui/src/molecules, built from atoms and tokens, with a story per declared state, a behaviour test beside each component that has a callback or state prop, and approved baselines. The board and its shot are deleted (with its canvas.json entries), R66.

### Board molecule to component
| Board | Component | Stories (Storybook id prefix molecules-) | States declared |
|---|---|---|---|
| item.row (rest, pressed, done, swiped, loading) | ItemRow (reworked: card, avatar, done, swiped, loading; old props still work for ListScreen) | itemrow--rest, --pressed, --in-cart, --swiped, --loading, --focus, --disabled, --amount-only (not a state) | rest, inCart, pressed, focus, disabled, swiped, loading |
| add.bar (rest, focus) | AddBar (TextField with the inline Add button) | addbar--rest, --filled, --focus, --disabled | rest, filled, focus, disabled |
| field.labelled (rest, error) | LabelledField (TextField gains placeholder and a soft action button) | labelledfield--rest, --filled, --focus, --disabled, --invalid (the board's error) | rest, filled, focus, disabled, invalid |
| section.header | SectionHeader (IconTile, Text, Count) | sectionheader--rest, --dairy-and-eggs | rest |
| progress.bar | ProgressBar (Text x 2, Meter) | progressbar--empty, --part, --full | empty, part, full |
| meal.card | MealCard (tone, link) | mealcard--rest, --pressed, --focus, --disabled, --tomato, --neutral | rest, pressed, focus, disabled |
| meal.empty | MealEmpty | mealempty--rest, --pressed, --focus, --disabled | same |
| avatar.stack (online, away) | AvatarStack (Avatar x n) | avatarstack--away, --online | away, online |
| toast | Toast (Avatar small on chartreuse, Text) | toast--rest, --planned | rest |
| stepper.servings (rest, min) | ServingsStepper (Button iconGhost x 2) | servingsstepper--rest, --min, --max, --pressed, --focus, --disabled | rest, min, max, pressed, focus, disabled |
| tab.item (active, rest, pressed, focus) | TabItem (role tab; Count accent) | tabitem--active, --rest, --pressed, --focus, --disabled | active, rest, pressed, focus, disabled |
| suggestion.row (rest, pressed) | SuggestionRow | suggestionrow--rest, --pressed, --focus, --disabled | rest, pressed, focus, disabled |
| week.nav | WeekNav (Button iconGhost x 2, Text) | weeknav--rest | rest |
| status.banner (offline, syncing, synced) | StatusBanner | statusbanner--offline, --syncing, --synced | offline, syncing, synced |
| status.row (waiting, joined) | StatusRow | statusrow--waiting, --joined | waiting, joined |
| invite.summary | InviteSummary (Avatar xl, Text) | invitesummary--rest | rest |
| tile.day + meal | DayMeal (Tile + MealCard) | daymeal--rest, --pressed, --focus, --disabled | rest, pressed, focus, disabled |
| mascot | Mascot, already built by TASK-1.30 | - | - |

### Atom changes the board needed
- TextField: placeholder prop, and actionKind 'soft' (the Paste button in field.labelled).
- Avatar: size xl (64, invite.summary; story Xl) and a chartreuse small avatar (toast).
- Meter: the value is now written as aria-valuemin/max/now. accessibilityValue was not reaching the DOM, so the progressbar had no value for a screen reader; found by the ProgressBar behaviour test.

### Differences from DS-Molecules.png (AC #3), and why
- Shadows, outlines and press travel are drawn by react-native-web in the browser; the phones draw them natively (decision-2). Focus is a forest ring drawn outside the edge; the board's tab focus ring is inside, which TabItem keeps.
- ItemRow pressed is the tint only, not the board's 97% scale: scaling the row takes the checkbox under 44 x 44 (R42), and the browser pass fails it. Pressed rows elsewhere (MealCard, MealEmpty, SuggestionRow) do scale.
- ItemRow: the check is the 44 x 44 Checkbox atom, so the row's left padding and gap are reduced to keep the board's 60 high row. Loading draws a still grey circle (the Skeleton atom is a line) and two shimmering lines; the swipe itself is the screen's, the story shows the revealed state.
- ServingsStepper: a disabled minus keeps the Button atom's grey fill; the board overrides it to transparent inline. The atom's disabled look is the design-system rule (grocs.css), so I did not add an override prop for one molecule. Say if you want it flat.
- StatusRow waiting: the tomato dot is still (the board's ping animation is motion, TASK-1.30 style, and not wired here). StatusBanner syncing shows a spinner in the banner and in the busy button, as the board does.
- SuggestionRow: the whole row is the one button (named by its text); the plus is drawn in the soft icon-button look but is not a nested button.
- WeekNav label is ink, not muted (Text atom has no muted body size); ProgressBar counts use the muted small variant, not the board's heavy weight.
- LabelledField: the visible label is hidden from screen readers and the text box carries the same name ('Recipe link (optional)'). Error text is the TextField atom's caption size.
- AddBar placeholder is 'Add an item' (no ellipsis); its button is named 'Add'.
- reference-built: SPECIMEN_NAMES in tools/checks is outside this layer and not needed once the board is deleted, so I left it.
Rendered stories: packages/ui/visual-baselines/molecules-*.png (approved, committed); I looked at every one in contact sheets beside design/reference/shots/DS-Molecules.png (git history) before approving.

### Evidence
- vitest --project ui: 21 files, 569 tests pass (new behaviour tests: ItemRow, AddBar, LabelledField, ProgressBar, MealCard, MealEmpty, ServingsStepper, TabItem, SuggestionRow, WeekNav, StatusBanner, DayMeal; all by role and name with userEvent).
- pnpm -s typecheck: no errors in packages/ui (other packages show unresolved @grocs/* imports because this worktree has no node_modules of its own; I linked the main checkout's).
- pnpm --filter @grocs/ui visual: 234 story views, axe clean, 44 x 44 clean; baselines regenerated by visual:update only for the molecules (5 ItemRow baselines changed on purpose, one retired, 58 added); atom baselines unchanged.
- The tab story wraps TabItem in a tablist (nav.tabs, an organism, will supply it).

Correction to the table above: the toast molecule is ActivityToast (stories molecules-activitytoast--rest, --planned), not Toast. The reference-built check matches a built component named Toast to the Toast screen board (TASK-1.37.5) and would have asked for that board to be deleted, so the molecule took a different name.
<!-- SECTION:NOTES:END -->
