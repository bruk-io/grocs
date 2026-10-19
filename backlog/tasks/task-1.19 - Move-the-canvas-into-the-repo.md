---
id: TASK-1.19
title: Extract the tokens and art from the retired canvas
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 03:14'
labels:
  - design-system
  - finish-moved
  - size-5
milestone: m-1
dependencies:
  - TASK-1.14
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: Bruk retired the canvas in favour of Storybook. The task changed from moving the canvas into the repo to extracting its tokens and art, and gained the design-system checks for R38, R39, R42, R60 and R61, which no task cited.

Finish moved on 2026-10-18 before work started: added the story renderer, which every later UI task uses to compare its stories with the reference screenshots (now in design/reference/shots/). Bruk asked for the UI components and screens to be built from the design, without logic; that work follows this task (TASK-1.37 and its children).

Re-sized from 3 to 5 before work started: six criteria across tokens, art conversion, four checks and the renderer.

Label layer-ui removed on 2026-10-18: this task writes outside packages/ui (design/svg, the converter, new checks in tools/checks, package scripts), so it runs as a general builder at the routed model and effort rather than as builder-ui, whose definition is limited to packages/ui.
<!-- SECTION:NOTES:END -->
