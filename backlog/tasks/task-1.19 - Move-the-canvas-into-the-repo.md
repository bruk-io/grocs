---
id: TASK-1.19
title: Extract the tokens and art from the retired canvas
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 03:00'
labels:
  - size-3
  - design-system
  - finish-moved
  - layer-ui
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
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: Bruk retired the canvas in favour of Storybook. The task changed from moving the canvas into the repo to extracting its tokens and art, and gained the design-system checks for R38, R39, R42, R60 and R61, which no task cited.
<!-- SECTION:NOTES:END -->
