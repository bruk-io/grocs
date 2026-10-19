---
id: TASK-1.37.2
title: Molecules from the design reference
status: To Do
assignee: []
created_date: '2026-10-19 03:13'
labels:
  - size-5
  - layer-ui
  - design-system
milestone: m-2
dependencies:
  - TASK-1.37.1
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
- [ ] #4 Component tests render the stories and find elements by role and label (R50, R65)
- [ ] #5 DS-Molecules.dc.html and its shot are deleted once the Mascot (TASK-1.30) is also built (R66)
<!-- AC:END -->
