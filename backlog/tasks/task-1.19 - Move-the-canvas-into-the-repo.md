---
id: TASK-1.19
title: Extract the tokens and art from the retired canvas
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 03:46'
labels:
  - design-system
  - finish-moved
  - size-5
milestone: m-1
dependencies:
  - TASK-1.14
modified_files:
  - packages/ui/src/tokens/tokens.json
  - packages/ui/src/tokens/tokens.ts
  - tools/build-tokens.ts
  - tools/build-svg.ts
  - tools/shots.ts
  - tools/checks/svg-art.ts
  - tools/checks/reference-built.ts
  - tools/checks/ui-library.ts
  - tools/checks/story-coverage.ts
  - tools/checks/import-layers.ts
  - tools/checks/design-tokens.ts
  - tools/checks/registry.ts
  - packages/ui/package.json
  - package.json
  - pnpm-lock.yaml
  - design/svg
  - packages/ui/src/icons
  - packages/ui/src/mascots
  - packages/ui/src/organisms/kitchen
  - packages/ui/src/atoms
  - packages/ui/src/molecules
  - packages/ui/.storybook
  - packages/ui/src/stories.test.tsx
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bruk retired the canvas on Oct 18, 2026; Storybook is the design system (R66). This is the spec's 'Retiring the canvas' steps 2 and 3, plus the checks that keep the design system honest. Step 1 is done: the boards are in design/reference/ and the reviews are doc-2. Waits on D9 (TASK-1.14). Cites R38, R39, R42, R59, R60, R61, R62, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 tokens.json carries the reference grocs.css values, and nothing in packages/ui uses a raw colour, size, radius, type or motion value (R39, R59)
- [ ] #2 The mascot, icon and kitchen-scene art is in design/svg/ and converted to React Native components by the tool, with a check that the generated files are in sync (R62)
- [ ] #3 A check fails when a name is both built in packages/ui or apps/mobile and still in design/reference/ (R66)
- [ ] #4 Checks fail when a design level imports upward, or an interactive component misses a required state (R60, R61)
- [ ] #5 Every story is checked for 4.5:1 text contrast and 44-point touch targets (R42), and both apps build from the one ui package (R38)
- [ ] #6 One command, pnpm --filter @grocs/ui shots, builds the browser Storybook and saves a PNG of every story at phone size, so a builder can compare a story with design/reference/shots/
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Delivers R38, R39, R42, R59, R60, R61, R62, R66 (spec "Retiring the canvas" steps 2 and 3), per decision-5, decision-6, decision-10.

### Order of work
1. Tokens (AC1): rewrite tokens.json from design/reference/grocs.css (colour, space, radius, size, type, shadow, motion durations and easings, color.mascot.* and color.scene.*); extend tools/build-tokens.ts to resolve {color.x} references so shadow colours are not duplicated; migrate the starter atoms and ItemRow, preview.tsx and tests to the new names; widen the design-tokens raw-value scan (JSX attributes, shadow, font family and weight, motion; art files scanned for colours only) and add real contrast pairs.
2. Art sources (AC2): extract the 6 mushrooms into design/svg/mascots/ with ids body, cap, eyeL, eyeR, mouth (plus optional extras), every distinct icon into design/svg/icons/, and split design/svg/scenes/kitchen.svg into kitchen.svg and kitchen-door.svg (it holds two root svg elements, which a converter cannot take).
3. Converter tools/build-svg.ts with @svgr/core 8.1.0 (native, typescript, svgo limited to harmless plugins so ids survive) plus a TypeScript-AST post-pass: icons become IconFrame children (stroke width from tokens.stroke.icon); mascots and scenes get hex mapped to tokens and part ids turned into Part elements. It also generates icons/index.ts. react-native-svg is added to packages/ui.
4. Checks (registered in registry.ts, with fixture tests): svg-art (generated-in-sync, part-names, mouth-structure), reference-built (R66), story-coverage/interactive-states (R61), import-layers unknown-ui-folder and no-self-barrel (R60, decision-6), ui-library/one-library (R38).
5. Story tests: every story checked for 4.5:1 text contrast and 44pt targets (R42) in the ui vitest project.
6. Renderer: pnpm --filter @grocs/ui shots builds Storybook and saves a PNG per story at phone width into a gitignored folder (Playwright with the preinstalled Chromium); stories for icons, mascots and kitchen so the PNGs can be looked at.
7. Run check, typecheck, test, check:release; write the report in the notes.

### Risks
- Renaming tokens touches every starter atom; mitigated by typecheck and the existing component tests.
- SVGR and svgo can drop ids or rewrite shapes; mitigated by a minimal svgo plugin list and the part-names check on the output.
- jsdom may not resolve react-native-web styles for the contrast and target tests; fallback is measuring in Chromium inside the shots run.
- Existing check files are protected: only additive, stricter changes; nothing excluded or loosened.
- The reference-built rule is ambiguous for partially built boards; defined as screen stem built, or every specimen component of a design-system board built.
- Fonts (Fredoka, Nunito) are not loaded on device: out of scope, noted.

### Proof
pnpm check, pnpm typecheck, pnpm test, pnpm check:release, pnpm svg run twice with no diff, pnpm tokens, pnpm --filter @grocs/ui shots and the PNGs viewed against design/reference/shots, fixture tests for each new rule.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: Bruk retired the canvas in favour of Storybook. The task changed from moving the canvas into the repo to extracting its tokens and art, and gained the design-system checks for R38, R39, R42, R60 and R61, which no task cited.

Finish moved on 2026-10-18 before work started: added the story renderer, which every later UI task uses to compare its stories with the reference screenshots (now in design/reference/shots/). Bruk asked for the UI components and screens to be built from the design, without logic; that work follows this task (TASK-1.37 and its children).

Re-sized from 3 to 5 before work started: six criteria across tokens, art conversion, four checks and the renderer.

Label layer-ui removed on 2026-10-18: this task writes outside packages/ui (design/svg, the converter, new checks in tools/checks, package scripts), so it runs as a general builder at the routed model and effort rather than as builder-ui, whose definition is limited to packages/ui.

Delivery report (branch worktree-agent-a303c7a446ab592a5).
AC1 tokens: tokens.json carries grocs.css values (color, mascot, scene, space, radius, size, font, shadow, opacity, motion, stroke, contrastPairs); atoms, ItemRow, preview and both app screens migrated. Evidence: pnpm check passes (12 checks) incl. design-tokens, which now also scans JSX attributes, borders, margins, durations, fonts.
AC2 art: 21 icons, 6 mascots (cremi shii chanty ollie morty enoki), kitchen scene and door extracted to design/svg/; pnpm svg writes 31 generated files, idempotent; check svg-art/generated-in-sync fails on drift or stale files.
AC3 reference-built check (reference-built/still-in-reference): screen boards by stem; DS boards when every labelled specimen is built; D1/D2 option boards ignored. No board is currently flagged, so none was deleted.
AC4 import-layers: icons/mascots levels, unknown-ui-folder, no-self-barrel; story-coverage/interactive-states requires rest, pressed, focus, disabled (+loading, error when the prop exists). TextField gained a Pressed state and story.
AC5 packages/ui/src/stories.accessibility.test.tsx: per story 4.5:1 contrast and 44pt targets, with a self-test proving both detectors fire. ui-library check: apps list @grocs/ui and no design-level folders outside packages/ui (R38).
AC6 pnpm --filter @grocs/ui shots: 39 of 39 stories saved to packages/ui/.shots/ (gitignored) at 393x852.
Fixture tests: tools/checks/design-system-checks.test.ts (31 tests). Final runs: pnpm check, typecheck, test (37 files, 356 tests), check:release all pass.
Not done / judgements: Welcome prop poses (spoon, tomato, scrub) not extracted; scene colours are hex-named under color.scene (deviates from decision-10 naming); fonts bundled for Storybook only, no on-device loading; shadows not applied to starter atoms; contrast and target tests are jsdom-based and read declared sizes; decision-6 pnpm/.npmrc/Node 24 steps untouched; vitest.config.ts changed additively (react-native-svg web alias) so ui and app projects render SVG.
<!-- SECTION:NOTES:END -->
