---
id: TASK-58
title: 'Meal plan header shows sample household avatars (A, S)'
status: To Do
assignee: []
created_date: '2026-11-06 19:50'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found in the 2026-11-06 device sweep. PlanScreen passes members={household} from src/sample/sample-data.ts; its comment calls this TASK-27's territory, but TASK-27 (The app reads its kitchen's name and members) is Done, so the real members exist to read.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The meal plan header shows the kitchen's real members' initials
<!-- AC:END -->
