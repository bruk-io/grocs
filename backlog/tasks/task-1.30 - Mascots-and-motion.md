---
id: TASK-1.30
title: Mascots and motion
status: To Do
assignee: []
created_date: '2026-10-18 18:16'
updated_date: '2026-10-19 03:13'
labels:
  - size-5
  - design-system
  - layer-ui
  - finish-moved
milestone: m-3
dependencies:
  - TASK-1.11
  - TASK-1.19
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
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: this task now builds the Mascot molecule and every mushroom's data under TASK-1.37's UI build; placing a host on each screen moved to the screen tasks (TASK-1.37.4, TASK-1.37.5). Criteria follow decision-5, which Bruk accepted.
<!-- SECTION:NOTES:END -->
