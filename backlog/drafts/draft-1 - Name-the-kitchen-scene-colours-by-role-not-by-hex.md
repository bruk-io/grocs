---
id: DRAFT-1
title: 'Name the kitchen scene colours by role, not by hex'
status: Draft
assignee: []
created_date: '2026-10-19 03:53'
labels:
  - size-2
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.19. The kitchen-scene colours are in tokens.json as color.scene.h<hex> (for example color.scene.h5e9952), against decision-10's role-based token naming. A hex-named token says nothing about what it paints, so a palette change means renaming every token and every generated reference, and the art cannot be retinted by role. Evidence: packages/ui/src/tokens/tokens.json color.scene; tools/build-svg.ts maps hex to these names.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every color.scene token is named for what it paints (for example cabinet, wall, foliage), per decision-10
- [ ] #2 pnpm svg regenerates the scene from the renamed tokens with no hand edits, and pnpm check passes
<!-- AC:END -->
