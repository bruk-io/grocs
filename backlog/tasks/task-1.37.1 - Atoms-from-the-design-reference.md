---
id: TASK-1.37.1
title: Atoms from the design reference
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 03:12'
updated_date: '2026-10-19 05:16'
labels:
  - size-5
  - layer-ui
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.6
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every atom on design/reference/DS-Atoms.dc.html as a ui component (R38, R39, R60), extending or replacing the skeleton's starter atoms. Compare with design/reference/shots/DS-Atoms.png using pnpm --filter @grocs/ui shots. Cites R39, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Every atom on the DS-Atoms board is a component in packages/ui/src/atoms built only from tokens, and the task notes map each board atom to its component
- [x] #2 Each atom has a story for every state it declares, including pressed, focus, disabled, loading and error where they apply (R61, R63)
- [x] #3 Rendered with pnpm --filter @grocs/ui shots, the atom stories match DS-Atoms.png in shape, colour, type and spacing; any difference is listed in the notes with its reason
- [x] #4 DS-Atoms.dc.html and its shot are deleted (R66)
- [x] #5 Every story renders accessibly, every callback and state prop has a behaviour test that drives it by role and label, and the browser pass is clean, with each story's baseline approved and committed (decision-11 levels 1 to 3; R50, R65)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Tokens: add the few values the board uses that tokens.json lacks (focus outline width and offset, press travel, spark size, press scales, spin and shimmer durations); run pnpm tokens.
2. Type faces: packages/ui/src/typography/font-face.ts maps a token family and weight to what the platform needs: the CSS family plus fontWeight on web, a per-weight family name on the phones (Fredoka_700Bold, Nunito_800ExtraBold: native cannot pick a weight inside one family). Every text atom uses it.
3. Atoms in packages/ui/src/atoms, one file each with its *_STATES list and stories: Text (nine type tokens, legacy title/muted/struck kept for the screens), Button (primary, secondary, soft, text, back, icon, icon-soft, icon-ghost; sizes m and s; rest, pressed, focus, disabled, loading), TextField (rest, filled, focus, error, disabled, plus the inline add bar), Checkbox (the board's circular check, adds ticking; Space toggles), Switch, Meter, Chip (meal, quick-add), Badge (five meal tones), Tag, Count, Avatar, Tile (day), IconTile, SpeechBubble, InviteCode, Spinner, Skeleton. Icons are the existing generated set. Mascots are TASK-1.30 and not touched.
4. Exports in src/index.ts; ItemRow and apps keep working through unchanged prop names.
5. Behaviour tests (decision-11 level 2) for every callback or state prop: Button, Checkbox (adds Space), TextField, Switch, Chip; others have none.
6. Fonts on the device: apps/mobile gets expo-font and the two @expo-google-fonts packages and loads the six faces at start (apps/mobile/app/_layout.tsx), the only edit outside packages/ui.
7. pnpm --filter @grocs/ui shots to compare with DS-Atoms.png; fix differences; visual:update; look at every new baseline; delete DS-Atoms.dc.html, its shot and its canvas.json entry (R66).
8. Merge main, run pnpm check, typecheck, test, the visual pass.

### Risks
- boxShadow, outline and transform on react-native-web and on the phones differ from CSS; compare on web only, and note that sign-off is on the phones.
- Spinner and Skeleton move: they honour reduced motion (media query and window.__GROCS_REDUCE_MOTION__) so baselines hold still.
- Fonts: native needs per-weight family names and the app must register exactly those; a mismatch silently falls back to the system font.
- TASK-1.30 edits index.ts, tokens and the baseline manifest too; kept additive to ease the merge.

### Proof
pnpm check, typecheck, vitest --project ui, build-storybook, visual (axe, 44x44, baselines), shots side by side with the board. Delivers R39, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: Bruk asked for the right level of testing in the UI build. The component-test criterion is replaced by decision-11's levels (render and accessibility, behaviour, browser pass with axe and visual baselines), and the task now waits on the harness, TASK-1.37.6.

Finish moved on 2026-10-18 before work started: the TASK-1.19 review found the fonts bundled for Storybook only. The text atoms are where that first shows, so on-device font loading joins this task.

Review of TASK-1.37.6 found: on react-native-web the Checkbox toggles on Enter but not on Space (WAI-ARIA checkbox pattern requires Space). Fix it here and add a Space case to packages/ui/src/atoms/Checkbox.behaviour.test.tsx.

## Report (builder-ui)

Branch worktree-agent-abd150c2115dfbeb8. Every atom on DS-Atoms is a component in packages/ui/src/atoms, built from tokens, with a story per declared state. The board and its shot are deleted (R66), with its canvas.json entries.

### Board atom to component
| Board | Component | Stories (Storybook id prefix atoms-) |
|---|---|---|
| text.display ... text.micro | Text (variants display, titleL, titleM, heading, label, body, small, caption, micro; title, muted, struck kept for the screens) | text--display ... text--micro |
| button.primary, --s | Button variant primary, size m or s | button--rest, --pressed, --focus, --disabled, --loading; button--primary-small-* |
| button.secondary, --s | Button variant secondary | button--secondary-*, button--secondary-small-* |
| button.soft, .text, .back | Button variants soft, text, back | button--soft-*, --text-*, --back-* |
| button.icon, --soft, --ghost | Button variants icon, iconSoft, iconGhost (icon prop) | button--icon-*, --icon-soft-*, --icon-ghost-* |
| input.text rest, focus, filled, error, disabled | TextField (invalid = error) | textfield--rest, --focus, --filled, --invalid, --invalid-focus, --disabled, --pressed |
| input.text--inline | TextField with actionLabel and onAction | textfield--inline-rest, --inline-focus, --inline-disabled |
| check--off, --pressed, --on, --ticking, --focus, --disabled | Checkbox | checkbox--rest, --pressed, --checked, --ticking, --focus, --disabled |
| switch--off, --on, --focus, --disabled, --disabled-on | Switch (plus pressed) | switch--rest, --on, --focus, --disabled, --disabled-on, --pressed |
| meter--empty, --part, --full | Meter | meter--empty, --part, --full |
| chip.meal, chip.quick-add (rest, pressed, selected, focus, disabled) | Chip kind meal or quickAdd | chip--*, chip--quick-add-* |
| badge.meal--amber, --sky, --tomato, --leaf, --neutral | Badge tone | badge--amber ... --neutral |
| tag.status, .neutral, .new, .sync, .date | Tag kind | tag--status ... --date |
| count.neutral, .accent | Count | count--neutral, --accent |
| avatar.l, --online, avatar.s | Avatar | avatar--large, --online, --small |
| tile.day | Tile | tile--rest |
| icon.* (24 grid) | the generated icons, unchanged (icons/Set stories) | icons-set--grid |
| icon.tile | IconTile | icontile--rest |
| speech.bubble | SpeechBubble | speechbubble--rest |
| invite.code | InviteCode | invitecode--rest |
| spinner | Spinner | spinner--rest |
| skeleton.line | Skeleton | skeleton--rest |
| mascot.* | not built here: TASK-1.30 | - |

### Differences from DS-Atoms.png (AC #3), and why
- Shadows, outlines and press travel are drawn by react-native-web in the browser; the phones draw them natively, so the lip and the focus ring are signed off on the phones (decision-2).
- Checkbox is the board's circle on both platforms. The skeleton's iOS circle / Android rounded-square switch is gone: the board shows one shape.
- Meter, Skeleton and InviteCode fill the width they are given; the board fixes them at 120 and about 200 wide because it lays them in a grid cell.
- Small buttons are as wide as their label; medium primary and secondary fill the row, as on the board.
- The ticking check is drawn still (check and six sparks); its motion is TASK-1.30's. Spinner and Skeleton move, and hold still under reduced motion (media query or window.__GROCS_REDUCE_MOTION__), so baselines are stable.
- A loading button's accessible name is what it now says ("Adding"), so the visible text is inside the name (axe label-content-name-mismatch).
- Stories use sample strings of the board where it has them; the Invalid story shows 'Fried rice' with the error, as the board does.
- Pressed Chip shrinks the pill inside a 44 x 44 target, so the pressed state still passes the 44 x 44 rule.

### Decisions worth knowing
- Phones cannot pick a weight in one family, so platform/font-face.ts gives per-weight family names on native (Fredoka_700Bold, Nunito_800ExtraBold, the names @expo-google-fonts exports) and CSS family plus weight on the web. Text atoms all use it.
- Tokens added (tokens.json, pnpm tokens): size.focusOutline, focusOffset, press, spark and six icon sizes; scale.pressRow and pressChip; motion.duration.spin and shimmer.
- Checkbox, Switch (and Chip, a button) work from Space and Enter: atoms/keyboard.ts adds Space on key up, because react-native-web presses only role=button on Space. Checkbox.behaviour.test.tsx has the Space case (finding from TASK-1.37.6).
- TextField is the only atom with a button inside (inline add); it composes Button.

### Fonts on the device (AC #6)
The one edit outside packages/ui: apps/mobile/app/_layout.tsx registers the five faces with expo-font's useFonts (imported from @expo-google-fonts/fredoka and nunito) and draws nothing until they load or fail; apps/mobile/package.json gains those two packages and expo-font (lockfile updated). apps/mobile/src/layout-fonts.test.ts fails if a face named in font-face.ts is not imported and registered. Not run on a phone here (no device in this sandbox): that needs a dev build; the check is that the names match and the layout waits.

### Evidence
pnpm check passes (13 checks); pnpm typecheck passes; pnpm test: 627 tests pass (new behaviour tests: Switch, Chip, TextField, and Space on Checkbox; Button updated); pnpm --filter @grocs/ui visual: 135 story views, axe clean, 44 x 44 clean, 135 images compared; baselines regenerated with visual:update and looked at against DS-Atoms.png in contact sheets (buttons all ten variants x five states, inputs, selection, chips, badges, tags, counts, avatars, tile, bubble, code); ItemRow baselines changed only through the new type face and ring.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(340 earlier lines omitted)
```text
|  1.64 kB │ gzip:   0.87 kB
|  storybook-static/assets/Tag.stories-B1x_bZFe.js
|  2.06 kB │ gzip:   1.05 kB
|  storybook-static/assets/Text-CNbA_UeF.js
|  2.23 kB │ gzip:   0.83 kB
|  storybook-static/assets/ItemRow.stories-B184V4C7.js
|  2.69 kB │ gzip:   1.25 kB
|  storybook-static/assets/Avatar.stories-DQJtZ5b6.js
|  2.71 kB │ gzip:   1.19 kB
|  storybook-static/assets/Checkbox-C7gTAMtw.js
|  2.76 kB │ gzip:   1.27 kB
|  storybook-static/assets/Switch.stories-DFA9yjCx.js
|  2.89 kB │ gzip:   1.28 kB
|  storybook-static/assets/Chip.stories-CfJDmbKN.js
|  3.97 kB │ gzip:   1.72 kB
|  storybook-static/assets/Button.stories-AKIIix4L.js
|  3.99 kB │ gzip:   1.18 kB
|  storybook-static/assets/TextField.stories-CWbRLUmw.js
|  4.59 kB │ gzip:   1.82 kB
|  storybook-static/assets/Button-BO2at4Ws.js
|  5.26 kB │ gzip:   1.88 kB
|  storybook-static/assets/Mascots.stories-euDJv_9D.js
|  10.60 kB │ gzip:   2.70 kB
|  storybook-static/assets/Kitchen.stories-Dje0rhzn.js
|  13.91 kB │ gzip:   3.32 kB
|  storybook-static/assets/icons-SguvmkZ1.js
|  15.61 kB │ gzip:   2.56 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-nlsVQ_gS.js
|  35.58 kB │ gzip:  10.07 kB
|  storybook-static/assets/react-18-CZ3BrPqf.js
|  211.29 kB │ gzip:  66.05 kB
|  storybook-static/assets/iframe-CsjgQsBL.js
|  1,355.85 kB │ gzip: 391.28 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 3.71s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-abd150c2115dfbeb8/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-abd150c2115dfbeb8/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 135 story views checked (axe, 44 x 44, 135 images compared)
```

## Review (philosophy:reviewer)
Not closed: AC #6 unmet for lack of device evidence. ACs 1-5 ticked.
- Re-ran record-check --tier full (check, typecheck, test 628 pass, test:emulator, check:release, build-storybook, visual 135 views axe/44x44/baselines): exit 0, no files rewritten.
- Baselines vs DS-Atoms.png (read from main's tree): buttons, inputs, check (incl. ticking sparks), switch, meter, chips, badges, tags, count, avatar, tile, bubble, invite code match in shape, colour, type and spacing. Listed differences have sound reasons (web-drawn lip/ring, fill-width meters, one checkbox shape, still ticking frame).
- Behaviour tests drive by role and name and cover every callback and state prop on Button, Checkbox (Space on and while disabled), Switch, Chip, TextField (onChangeText, onSubmit, onAction, disabled, invalid).
- ItemRow baseline deltas: inspected focus; differences are the Nunito face and the new double focus ring; no layout change seen.
- platform/font-face.ts: weights 600/700/800 all mapped; every face it names is imported and registered in _layout.tsx, guarded by layout-fonts.test.ts. Minor: an unmapped weight falls back to the web family name on native silently.
- AC #6: evidence shows names match and the layout waits for useFonts; it does not show the fonts render on a phone (no device here), and on failure the app draws in the system face silently. Filed DRAFT-3 (size-1) to confirm on iOS and Android dev builds and make the fallback loud. Once DRAFT-3's screenshots exist, tick #6 and close.

Finish moved on 2026-10-19 at review: criterion 6 (fonts load on both phones) needs a phone, which the cloud session doesn't have. It moved, with the review's silent-fallback finding, to TASK-1.37.7, assigned to Bruk, so this task closes on what it proved and the molecules can start.
<!-- SECTION:NOTES:END -->
