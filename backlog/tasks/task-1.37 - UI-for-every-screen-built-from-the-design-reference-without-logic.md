---
id: TASK-1.37
title: 'UI for every screen, built from the design reference, without logic'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 03:12'
updated_date: '2026-10-19 03:13'
labels:
  - size-8
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bruk asked on Oct 18, 2026 for the design to be turned into real components and screens now, without wiring any logic: every atom, molecule, organism and template from the retired canvas as a ui component with stories, and every screen as a route in the app that renders its template with sample data. Logic is wired later by the slices (TASK-1.20 onwards), which then reuse these components. Sized 8, so it is split into one task per design level and two for screens. The reference is design/reference/ and its screenshots in design/reference/shots/. Cites R38, R39, R40, R41, R42, R50, R60, R61, R63, R65, R66.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every screen in design/reference (except the parked RecipeImport and the D1 and D2 options) is a route in the app that matches its reference screenshot, built only from packages/ui components
- [ ] #2 The walking skeleton's add-item flow and every existing test still pass
<!-- AC:END -->
