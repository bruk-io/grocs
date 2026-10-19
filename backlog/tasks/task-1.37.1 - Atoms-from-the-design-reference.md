---
id: TASK-1.37.1
title: Atoms from the design reference
status: To Do
assignee: []
created_date: '2026-10-19 03:12'
labels:
  - size-5
  - layer-ui
  - design-system
milestone: m-2
dependencies:
  - TASK-1.19
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every atom on design/reference/DS-Atoms.dc.html as a ui component (R38, R39, R60), extending or replacing the skeleton's starter atoms. Compare with design/reference/shots/DS-Atoms.png using pnpm --filter @grocs/ui shots. Cites R39, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every atom on the DS-Atoms board is a component in packages/ui/src/atoms built only from tokens, and the task notes map each board atom to its component
- [ ] #2 Each atom has a story for every state it declares, including pressed, focus, disabled, loading and error where they apply (R61, R63)
- [ ] #3 Rendered with pnpm --filter @grocs/ui shots, the atom stories match DS-Atoms.png in shape, colour, type and spacing; any difference is listed in the notes with its reason
- [ ] #4 Component tests render the stories and find elements by role and label (R50, R65)
- [ ] #5 DS-Atoms.dc.html and its shot are deleted (R66)
<!-- AC:END -->
