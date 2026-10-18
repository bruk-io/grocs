---
id: TASK-1.34
title: >-
  Release-bundle check catches dev code by what it is, not by three marker
  strings
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:39'
updated_date: '2026-10-18 20:47'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.4 (low). check:release looks for three marker strings, so dev-only code under another name would reach release unnoticed (R53, R64).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Any module under a development-only path or testing entry that reaches a release bundle fails the check, whatever its contents
<!-- AC:END -->
