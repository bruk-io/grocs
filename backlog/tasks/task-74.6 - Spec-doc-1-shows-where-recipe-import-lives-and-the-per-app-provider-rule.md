---
id: TASK-74.6
title: Spec doc-1 shows where recipe import lives and the per-app provider rule
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:05'
updated_date: '2026-11-07 01:09'
labels:
  - size-1
  - core
dependencies:
  - TASK-74.1
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-15 puts recipe import's server-only code in providers-server (src/recipe, with pure code in src/recipe/pure held to core-purity) and adds a per-app provider rule (import-layers/app-providers). doc-1's repository layout and R26/R27 don't say either yet. Not to be edited until Bruk accepts decision-15.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 doc-1's repository layout lists providers-server's recipe import and its pure folder
- [ ] #2 doc-1's layer rules (R26/R27) state which provider packages each app may import, and that core-purity also covers providers-server/src/recipe/pure
- [ ] #3 doc-1 gains a requirement for kitchen recipes (decision-16) beside R6 to R8, and R36's personal fields include recipe content
<!-- AC:END -->
