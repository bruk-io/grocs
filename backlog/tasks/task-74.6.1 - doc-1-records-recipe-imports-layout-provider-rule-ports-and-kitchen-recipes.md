---
id: TASK-74.6.1
title: 'doc-1 records recipe import''s layout, provider rule, ports and kitchen recipes'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.4.1
parent_task_id: TASK-74.6
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-74.6 itself. This is board and spec work done through the backlog CLI (decision-3). Both decisions are accepted. doc-1's highest requirement is R66, so the kitchen-recipes requirement is R67, and R8 points to it. It depends on orch-ac-rewording because doc-1 must reflect the delete-wins note added to decision-16. Covers TASK-74.6 AC#1-#3.

Split key: orch-doc1. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TASK-74.6 AC#1-#3 are met. The layout lists providers-server/src/recipe and recipe/pure. R25 names the pure/ exception. R26/R27 state the per-app provider lists and the pure/ scope of core-purity, pure-folder and test-presence. R28 names the recipe importer port. R67 states kitchen recipes, with R8 pointing to it. R36 lists recipe content as personal
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `backlog doc view doc-1` and locate the repository layout block, R8, R25, R26, R27, R28, R36 and the last requirement (R66).
2. Using the backlog doc CLI, add the line `providers-server/src/recipe/  recipe import: fetch, cache, callable work (decision-15); pure/ parsing held to core-purity` under the providers entry in the layout.
3. Append to R25: 'One deliberate exception: server-only recipe parsing lives in packages/providers-server/src/recipe/pure, held to core-purity, import-layers/pure-folder and test-presence (decision-15).'
4. Append to R26: 'An app may import only its own providers: mobile imports providers-firebase, providers-device and providers-memory; functions imports providers-server. packages/providers-server/src/recipe/pure is held to the domain rules (no I/O, no clock, imports only core).'
5. Append to R27: 'import-layers/app-providers, import-layers/pure-folder, core-purity and test-presence enforce this.'
6. In R28's list of ports, add 'recipe importer (a port the server answers)', and add 'kitchen gateway' if it is missing.
7. Add a new requirement after R66: 'R67 An imported recipe is a kitchen-wide record, found from a meal whose link equals its source URL. Its content is written once and never edited, and a delete always wins, so importing a deleted recipe again is refused (decision-16, R20).' Append to R8: 'Kitchen recipes: see R67.'
8. In R36, extend the personal fields list with 'recipe titles, source URLs, images, ingredient lines and steps'.
9. Check each of TASK-74.6's acceptance criteria, add an implementation note citing decision-15 and decision-16, then commit to main locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- backlog/docs/doc-1*.md (via backlog doc CLI)
<!-- SECTION:PLAN:END -->
