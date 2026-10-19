---
id: TASK-1.30
title: Mascots and motion
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 05:06'
labels:
  - size-5
  - design-system
  - layer-ui
  - finish-moved
milestone: m-3
dependencies:
  - TASK-1.11
  - TASK-1.19
  - TASK-1.37.6
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on D6 and the canvas move. Cites R40, R41.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 One Mascot component in packages/ui (decision-5, Reanimated on react-native-svg) draws every mushroom from the design reference from data; each has stories for idle, reacting, speaking, reduced and pressed (R61, R62, R63)
- [ ] #2 Tapping a mascot plays its reaction and speech bubble, and the line is announced to screen readers (R40); it is a button at least 44 points square (R42)
- [ ] #3 All motion follows the reduce-motion setting through one MotionProvider, with a story toolbar switch for it (R41)
- [ ] #4 Rendered with pnpm --filter @grocs/ui shots, each mushroom matches its look in design/reference/shots/
- [ ] #5 The choice of keyframes, pose and duration is a pure function with unit tests, the tap and announcement have a behaviour test, and the browser pass is clean with each story's baseline approved and committed (decision-11)
- [ ] #6 The Welcome scene's mushroom props (spoon, tomato, scrub brush) are extracted from design/reference/Welcome.dc.html into design/svg/mascots/ and drawn by the Mascot as poses
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Files (all packages/ui unless noted):
- package.json: add react-native-reanimated 4.7.1 and react-native-worklets 0.13.0 (decision-5 pins); lockfile follows from pnpm install.
- src/motion/MotionProvider.tsx: { reduced } context, useMotion(); initial value reads window.__GROCS_REDUCE_MOTION__ or prefers-reduced-motion on web (decision-11 level 3), so baselines stay still. Exports from index.ts.
- src/mascots/<name>.ts x6 (cremi shii chanty ollie morty enoki): data { art, label, lines, idle, reaction, reactionPose } with keyframes ported from design/reference/grocs.css; durations, easings as token names (tokens.motion.*), resolved by Mascot. Plus src/mascots/motion.ts: pure motionFor(state, reduced) -> { animationName keyframes, pose, duration } and nextLine(lines, n); unit tests in motion.test.ts.
- src/molecules/Mascot.tsx (+ stories, behaviour test): Pressable >=44x44, role=button, label from data; tap swaps to reaction, shows Bubble (RN Text, opacity fade only when reduced), calls AccessibilityInfo.announceForAccessibility(line) and an aria-live region on web; lines cycle in order. MASCOT_STATES includes rest, pressed, focus, disabled (story-coverage rule) plus idle, reacting, speaking, reduced. Part motion goes through PartPropsContext (blink on eyeL/eyeR ry, body/cap CSS animation).
- Mascot stories: Molecules/Mascot per state, plus one story per mushroom; decorator wraps MotionProvider; Storybook toolbar global 'Reduce motion' in .storybook/preview.tsx.
- tokens: only add tokens if needed (tools generate tokens.ts; outside my layer, so avoid).
- Baselines: visual:update for the new stories only, viewed and committed with manifest.
- design/svg/mascots: Welcome props (spoon, tomato, scrub). RISK: tools/svg/render.ts has a closed list of part ids, so new ids fail svg-art/part-names; the tool is outside my layer and the rule says not to loosen checks. Will try, and report if blocked.
Order: provider, pure motion + tests, data, Mascot, stories, behaviour test, checks, browser pass, baselines, notes, merge main, commit.
Proof: vitest --project ui, typecheck, build-storybook, shots, visual; compare shots with design/reference/shots/Welcome.png.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: this task now builds the Mascot molecule and every mushroom's data under TASK-1.37's UI build; placing a host on each screen moved to the screen tasks (TASK-1.37.4, TASK-1.37.5). Criteria follow decision-5, which Bruk accepted.

Finish moved on 2026-10-18 before work started: Bruk asked for the right level of testing in the UI build. The component-test criterion is replaced by decision-11's levels (render and accessibility, behaviour, browser pass with axe and visual baselines), and the task now waits on the harness, TASK-1.37.6.

Finish moved on 2026-10-18 before work started: the TASK-1.19 review found the Welcome props (spoon, tomato, scrub) not extracted; as poses they belong with the Mascot.

## Report (builder-ui)

Branch worktree-agent-a2e2d87a91a73529b. Criteria 1 to 5 built; 6 (Welcome props) and the import check are BLOCKED on two edits outside my layer (below), so pnpm check is not green.

### Built
- Molecules/Mascot (packages/ui/src/molecules/Mascot.tsx): one component, art + data (decision-5). Pressable role=button, min 44 x 44, label "<Title>, tap to hear a line". Tap: reaction keyframes on an Animated.View (CSS animation), speech bubble (pop, or fade when reduced), AccessibilityInfo.announceForAccessibility(line), onPress(line). Lines cycle in order. Reaction, then speech, then idle, timed from tokens (react, talk) with timers (not onCSSAnimationEnd, so reduced and tests follow the same path).
- Data per mushroom: src/mascots/{cremi,shii,chanty,ollie,morty,enoki}.ts (+ data.ts, types.ts, frame.ts). Keyframes ported from design/reference/grocs.css; durations and easings are token names, resolved by motionFor. New tokens (tokens.json, regenerated tokens.ts): motion.duration.mascot* (14), motion.easing.soft/out, opacity.tucked.
- Pure core (src/mascots/motion.ts, part-props.ts): motionFor(data, state, reduced) picks keyframes, pose, bubble kind and hold time; lineFor; blinkKeyframes; partPropsFor (blink on eyeL/eyeR ry, Shii's shut eyes and drifting z). Unit tests: motion.test.ts, part-props.test.ts (49 tests).
- MotionProvider and useMotion (src/platform/motion.tsx): { reduced }. With no prop it reads window.__GROCS_REDUCE_MOTION__ or prefers-reduced-motion, so the browser pass stays still. Storybook toolbar "Reduce motion" (Browser setting, on, off) in .storybook/preview.tsx.
- Part (src/mascots/part.tsx) now draws a part as a Reanimated component when it is given a style (cached wrapper per component).
- Stories: Molecules/Mascot (Idle, Rest, Reacting, Speaking, Reduced, Pressed, Focus, Disabled) and Mascots/Cast (every mushroom x idle, reacting, speaking, reduced, pressed). Reacting and Speaking pin the state so they are deterministic.
- Behaviour test (Mascot.behaviour.test.tsx, 7 tests): by role and name, tap shows the line, announces it, calls onPress; lines in order and wrap; bubble leaves after the talk duration; keyboard Enter; reduced still announces; disabled does nothing.
- Probed in Chromium with reduce motion off: body bounce, blink (ry), bubble pop and hop all run as real CSS animations (REA-CSS-n) with no errors.

### Evidence
- vitest ui project 175+ stories/tests pass; pnpm test (all projects) 546 passed; pnpm typecheck clean; build-storybook ok; pnpm check:release clean.
- Browser pass: pnpm --filter @grocs/ui visual: 77 story views, axe clean, all buttons >= 44 x 44, 77 images compared. 38 new baselines (8 Molecules/Mascot + 30 Mascots/Cast) created with visual:update -- mascot; existing 39 untouched. Looked at the contact sheet of every cast story: caps, faces, glasses, sparkle, stalks match the reference art; Ollie's reacting pose is the tucked-away frame; Chanty's is the twirl frame; Shii asleep until the reaction.
- Compare: rendered stories are in packages/ui/.shots/mascots-cast--*.png and molecules-mascot--*.png (pnpm --filter @grocs/ui shots -- mascot); reference: design/reference/shots/Welcome.png (mushrooms in scene) and DS-Organisms.png (header and celebration mascots).

### Blocked, needs an owner
1. import-layers allow-list (tools/checks/import-layers.ts, ui: react, react-native, react-native-svg only): react-native-reanimated is not allowed in the ui layer, though decision-5 requires it. pnpm check fails 12 times with import-layers/no-io-packages, all about react-native-reanimated. I did not edit the check (fix-the-code rule). Needed: add /^react-native-reanimated$/ to ALLOWED_THIRD_PARTY.ui (and its test).
2. Criterion 6, Welcome props (spoon, tomato, scrub): tools/svg/render.ts has a closed list of part ids, so a new id in design/svg/mascots/*.svg fails svg-art/part-names. Not extracted. Needed: allow the prop ids (suggest spoon, tomato, scrub) as optional parts, then I draw them as poses. In the Welcome board the props are: Cremi's stir arm ellipse (16,47), Morty's scrub arm ellipse (18,46) and tomato circle (12,42, r5.5) with a leaf stalk, Chanty's watering arm ellipse (17,44); Ollie, Shii and the enoki have none.

### Edits outside packages/ui (needed to run the tests; mechanical)
- vitest.config.ts: ui and app projects inline react-native-reanimated and react-native-worklets, define __DEV__, and load packages/ui/test-setup.ts (jsdom matchMedia stub).
- pnpm-lock.yaml: reanimated 4.7.1 and worklets 0.13.0 added to packages/ui dependencies (decision-5 pins).
- tools/checks not touched.

### Deviations and limits
- Enoki stalks sway together, not out of step: a group transform is not an animatable SVG prop on the phones (decision-5 lists opacity, fill, stroke, geometry). Cremi's cap wobble is dropped for the same reason.
- Idle poses that need the props (stir, scrub, peek, wave) are not built until criterion 6 unblocks.
- Motion on the phones is not verified here (no device); web CSS is.

## Update (builder-ui): blockers cleared, criterion 6 done

The two checks were aligned on main (commit e5cc25b), not by me: react-native-reanimated is on the ui import allow-list, and spoon, tomato and scrub are optional mascot parts in tools/svg/render.ts. Both "Blocked" items in the report above are resolved by that; I merged main and did not touch either check.

- Criterion 6: extracted from Welcome.dc.html into design/svg/mascots/: cremi.svg gets `spoon` (stir arm), morty.svg gets `scrub` (arm) and `tomato` (circle and leaf stalk), hidden by default. `pnpm svg` regenerated the art. MascotData.poses (cremi `stir`, morty `scrub`) gives each pose its shown props and its own idle motion; Mascot takes `pose`; motionFor(data, state, reduced, pose) and partPropsFor show the props, held still when reduced.
- Stories: Mascots/Cast CremiStir, CremiStirReacting, MortyScrub, MortyScrubReacting (4 new baselines, viewed: spoon arm and the tomato match the Welcome board). Unit tests for poses added to motion.test.ts and part-props.test.ts.
- Chanty's watering arm has no prop in the criteria; not built.
- Evidence: pnpm check passed (13 checks); typecheck clean; browser pass 81 views, axe clean, 44 x 44 ok, 81 images compared after approving the 4 new baselines (existing 77 unchanged).
<!-- SECTION:NOTES:END -->
