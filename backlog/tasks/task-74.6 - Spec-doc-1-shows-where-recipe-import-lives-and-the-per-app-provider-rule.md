---
id: TASK-74.6
title: Spec doc-1 shows where recipe import lives and the per-app provider rule
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 01:05'
updated_date: '2026-11-07 05:34'
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
- [x] #1 doc-1's repository layout lists providers-server's recipe import and its pure folder
- [x] #2 doc-1's layer rules (R26/R27) state which provider packages each app may import, and that core-purity also covers providers-server/src/recipe/pure
- [x] #3 doc-1 gains a requirement for kitchen recipes (decision-16) beside R6 to R8, and R36's personal fields include recipe content
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Reviewer verdict: closed. Verified doc-1 on main at b661b6e. AC#1: layout line 147 lists providers-server src/recipe with its pure/ folder held to core-purity. AC#2: R26 says which provider packages each app may import (mobile: providers-firebase/device/memory; functions: providers-server) and holds src/recipe/pure to the domain rules; R25 and R27 name core-purity, import-layers/pure-folder, import-layers/app-providers and test-presence. AC#3: R67 adds kitchen recipes (decision-16, delete-wins) and R8 points to it; R36's personal fields now include recipe titles, source URLs, images, ingredient lines and steps. Child TASK-74.6.1 is Done. Orchestrator evidence: pnpm check 16 passed, typecheck clean, unit and emulator suites green. Minor, not filed: R67 is numbered at the end instead of sitting next to R6-R8, but R8 cross-references it, which meets 'beside' in substance. No drafts filed.
<!-- SECTION:NOTES:END -->
