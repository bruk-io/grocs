---
id: TASK-1.37.2
title: Molecules from the design reference
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 03:13'
updated_date: '2026-10-19 05:29'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: Bruk asked for the right level of testing in the UI build. The component-test criterion is replaced by decision-11's levels (render and accessibility, behaviour, browser pass with axe and visual baselines), and the task now waits on the harness, TASK-1.37.6.

Started 2026-10-19 01:2x while TASK-1.37.1 (a dependency) is not yet formally closed: its review ticked every criterion and the work is merged, but the reviewer's close-task run was blocked by the workspace's permission check, so the close waits on Bruk.
<!-- SECTION:NOTES:END -->
