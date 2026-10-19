---
id: TASK-1.37.1
title: Atoms from the design reference
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 03:12'
updated_date: '2026-10-19 04:33'
labels:
  - size-5
  - layer-ui
  - design-system
  - finish-moved
milestone: m-2
dependencies:
  - TASK-1.37.6
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
- [ ] #4 DS-Atoms.dc.html and its shot are deleted (R66)
- [ ] #5 Every story renders accessibly, every callback and state prop has a behaviour test that drives it by role and label, and the browser pass is clean, with each story's baseline approved and committed (decision-11 levels 1 to 3; R50, R65)
- [ ] #6 The bundled Fredoka and Nunito fonts load on the device in the app, not only in Storybook, so text atoms render in them on both phones
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18 before work started: Bruk asked for the right level of testing in the UI build. The component-test criterion is replaced by decision-11's levels (render and accessibility, behaviour, browser pass with axe and visual baselines), and the task now waits on the harness, TASK-1.37.6.

Finish moved on 2026-10-18 before work started: the TASK-1.19 review found the fonts bundled for Storybook only. The text atoms are where that first shows, so on-device font loading joins this task.

Review of TASK-1.37.6 found: on react-native-web the Checkbox toggles on Enter but not on Space (WAI-ARIA checkbox pattern requires Space). Fix it here and add a Space case to packages/ui/src/atoms/Checkbox.behaviour.test.tsx.
<!-- SECTION:NOTES:END -->
