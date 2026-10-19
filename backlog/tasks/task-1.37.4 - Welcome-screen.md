---
id: TASK-1.37.4
title: Welcome screen
status: To Do
assignee: []
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 06:49'
labels:
  - size-3
  - layer-app
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.3
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The signed-out screen in the app, rendering the Welcome template. No sign-in logic yet: Bruk asked for UI only. Compare with design/reference/shots/Welcome.png. Cites R40, R41, R53, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Opening the app signed out shows the Welcome screen matching Welcome.png: wordmark, tagline, the panning kitchen with its mushrooms, and the sign-in sheet
- [ ] #2 Continue with Google does nothing yet; in development builds the existing test sign-in stays reachable from the sheet and still leads to the list (R53)
- [ ] #3 Tapping a mushroom plays its reaction and speech bubble, announced to screen readers (R40), and with reduce motion on the kitchen holds still (R41)
- [ ] #4 Android and iOS bundles build, and pnpm check:release passes
- [ ] #5 Welcome.dc.html and its shot are deleted (R66)
- [ ] #6 Each route has a render test with its sample data, and its links lead to the routes the design shows (decision-11 level 4)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: added decision-11's route tests, after Bruk asked for the right level of testing in the UI build.

From the TASK-1.30 review: MotionProvider takes 'reduced' as a prop on the phones (packages/ui/src/platform/motion.tsx), and nothing in apps/mobile passes the OS setting yet. This task's reduce-motion criterion (R41) needs apps/mobile to pass AccessibilityInfo.isReduceMotionEnabled() and its reduceMotionChanged events into MotionProvider.

Checks changed: .claude/checks.json's full tier gained the browser pass (pnpm --filter @grocs/ui visual -- --no-build) in TASK-1.37.6 (commit 5a3cecc), merged into main after this task was accepted. Noted up front by the orchestrator so the close isn't refused for a change this task didn't make.
<!-- SECTION:NOTES:END -->
