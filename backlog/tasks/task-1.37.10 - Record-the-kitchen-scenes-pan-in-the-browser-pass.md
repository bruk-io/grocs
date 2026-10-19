---
id: TASK-1.37.10
title: Record the kitchen scene's pan in the browser pass
status: To Do
assignee: []
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 10:57'
labels:
  - size-2
  - testing
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.3. The KitchenScene Panning story's baseline is the still pose, because the browser pass forces reduce motion. That the scene actually pans is proved only by a unit test of sceneMotion and a one-off Playwright check the builder ran, not by anything recorded in the repo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The browser pass asserts, for the Panning story with reduce motion off, that the scene's transform changes over time, and for Reduced that it doesn't
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).
<!-- SECTION:NOTES:END -->
