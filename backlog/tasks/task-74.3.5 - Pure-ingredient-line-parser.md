---
id: TASK-74.3.5
title: Pure ingredient-line parser
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.3.1
  - TASK-74.3.2
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §9 parseIngredientLine. It lives in packages/providers-server/src/recipe/pure/, a deliberate decision-15 exception to providers-hold-no-rules (cite decision-15 in the plan). It is held to core rules: no globals such as Date or crypto, and no imports except @grocs/core and pure/ siblings. orch-pure-boundary makes the post-edit hook enforce that. Best effort: quantity and unit may be null, and the line is the source of truth. Covers TASK-74.3 AC#2.

Split key: providers-ingredient-line. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 pure/ingredient-line.ts exports parseIngredientLine(line): ParsedIngredient. line is trimmed, and quantity and unit are kept as written
- [ ] #2 ingredient-line.test.ts has table tests for: Unicode fractions (½, 1¼), mixed numbers (1 1/2), ranges (2-3, 2 to 3), bracketed sizes ('1 (14-ounce) can chickpeas' → quantity '1', unit '(14-ounce) can', item 'chickpeas'), a note after the first comma excluded from item ('2 onions, finely chopped' → item 'onions'), no quantity ('salt to taste' → quantity null, unit null), common units and abbreviations (cup, tbsp, tsp, g, kg, ml, oz, lb, clove, pinch) and plural units
- [ ] #3 Pure-folder, core-purity and test-presence pass. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/providers- passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the table of cases first, then the parser.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/pure/ingredient-line.ts
- packages/providers-server/src/recipe/pure/ingredient-line.test.ts
<!-- SECTION:PLAN:END -->
