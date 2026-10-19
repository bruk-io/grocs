---
id: TASK-1.37.3
title: Organisms and screen templates from the design reference
status: To Do
assignee: []
created_date: '2026-10-19 03:13'
labels:
  - size-5
  - layer-ui
  - design-system
milestone: m-2
dependencies:
  - TASK-1.37.2
  - TASK-1.30
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every organism on design/reference/DS-Organisms.dc.html, including the panning kitchen scene, and one template per screen from DS-Templates.dc.html. A template lays out a whole screen and takes all of its content as props, so stories can show each screen with sample data and the app can render it the same way. Compare with design/reference/shots/ (the DS boards and each screen's shot). Cites R39, R41, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every organism on the DS-Organisms board is a component in packages/ui/src/organisms built from molecules, atoms and tokens only, including the kitchen scene, which pans and holds still under reduce motion (R41, R60)
- [ ] #2 There is a template in packages/ui/src/templates for every reference screen except RecipeImport, taking all content as props, with a story per screen state shown in design/reference (for example empty, offline, toast, invalid invite)
- [ ] #3 Rendered with pnpm --filter @grocs/ui shots, each template story matches its screen's reference screenshot; any difference is listed in the notes with its reason
- [ ] #4 Component tests render the stories and find elements by role and label (R50, R65)
- [ ] #5 DS-Organisms.dc.html, DS-Templates.dc.html and their shots are deleted (R66)
<!-- AC:END -->
