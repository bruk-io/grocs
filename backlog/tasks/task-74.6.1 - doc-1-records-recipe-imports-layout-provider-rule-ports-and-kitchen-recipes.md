---
id: TASK-74.6.1
title: 'doc-1 records recipe import''s layout, provider rule, ports and kitchen recipes'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:23'
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
- [x] #1 TASK-74.6 AC#1-#3 are met. The layout lists providers-server/src/recipe and recipe/pure. R25 names the pure/ exception. R26/R27 state the per-app provider lists and the pure/ scope of core-purity, pure-folder and test-presence. R28 names the recipe importer port. R67 states kitchen recipes, with R8 pointing to it. R36 lists recipe content as personal
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done through the backlog CLI (backlog doc update doc-1 --content), steps 1-8 of the plan; step 9's AC ticking and the close are left to the reviewer, as the orchestrator's brief says. Sources: decision-15 (providers-server/src/recipe, pure/ held to core-purity, import-layers/app-providers and pure-folder) and decision-16 including its 2026-11-07 delete-wins amendment (re-importing a deleted recipe is refused, R20).

Evidence (git diff -U0 --word-diff on doc-1):
- Layout, under providers-server/: '│   │   └── src/recipe/         recipe import: fetch, cache, callable work (decision-15); pure/ parsing held to core-purity' (TASK-74.6 AC#1)
- R25 + 'One deliberate exception: server-only recipe parsing lives in packages/providers-server/src/recipe/pure, held to core-purity, import-layers/pure-folder and test-presence (decision-15).'
- R26 + 'An app may import only its own providers: mobile imports providers-firebase, providers-device and providers-memory; functions imports providers-server. packages/providers-server/src/recipe/pure is held to the domain rules (no I/O, no clock, imports only core).' (TASK-74.6 AC#2)
- R27 + 'import-layers/app-providers, import-layers/pure-folder, core-purity and test-presence enforce this.' (names confirmed in tools/checks/import-layers.ts lines 142/148, core-purity.ts, test-presence.ts)
- R28 ports list now '..., id generation, logging, the kitchen gateway and the recipe importer (a port the server answers).' (kitchen gateway was missing; packages/ports/src/kitchen-gateway exists)
- R67 added after R66: 'An imported recipe is a kitchen-wide record, found from a meal whose link equals its source URL. Its content is written once and never edited, and a delete always wins, so importing a deleted recipe again is refused (decision-16, R20).'; R8 + 'Kitchen recipes: see R67.' (TASK-74.6 AC#3)
- R36 personal fields now '(item names, amounts, meal names, links, recipe titles, source URLs, images, ingredient lines and steps)' (TASK-74.6 AC#3)
No other lines of doc-1 changed (word-diff shows only these 8 hunks plus updated_date).

pnpm check: 'checks passed (16 checks, all mode, 415 ms)'

Reviewer verdict: closed. AC#1 verified directly in doc-1 on main at 6b8e90f: layout line for providers-server src/recipe with pure/ (line 147), R25 pure/ exception, R26 per-app provider lists and pure/ domain rules, R27 names app-providers, pure-folder, core-purity, test-presence, R28 adds kitchen gateway and recipe importer, R67 kitchen recipes with delete-wins (decision-16), R8 points to R67, R36 lists recipe fields as personal. Orchestrator evidence: pnpm check 16 passed, typecheck, unit and emulator suites green. Findings: none filed. Minor: the layout line names pure/ inside the src/recipe entry rather than a separate recipe/pure line; it is accurate enough to count as listing it.
<!-- SECTION:NOTES:END -->
