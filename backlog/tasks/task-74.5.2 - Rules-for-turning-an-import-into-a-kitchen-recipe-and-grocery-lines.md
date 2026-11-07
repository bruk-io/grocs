---
id: TASK-74.5.2
title: Rules for turning an import into a kitchen recipe and grocery lines
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-core
dependencies:
  - TASK-74.3.1
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §2. Decision-16's mapping rules live in core so the command and the screens share them (R25). Ingredient to grocery line: name = item ?? line, and amount = quantity and unit as written, or null. Meal to recipe: matched by link. Covers TASK-74.5 AC#2 (the mapping) and AC#4 (finding a saved recipe without the server).

Split key: core-kitchen-recipe-rules. Layer: core. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 model/kitchen-recipe.ts exports GroceryLine, recipeFromImport, recipeForLink and groceryLineFor as in contract §2
- [ ] #2 kitchen-recipe.test.ts covers: recipeFromImport sets id = recipeId, takes addedBy and createdAt from the stamp, sets deleted to null and leaves the content unchanged; recipeForLink matches on exact sourceUrl, skips deleted recipes, and returns null for a null link or no match; groceryLineFor covers item+quantity+unit ('½ cup'), quantity only, unit only, no quantity (amount null) and no item (name = line)
- [ ] #3 Exported from packages/core/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/core passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the three functions with doc comments citing decision-16.
2. Write the example tests.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/core/src/model/kitchen-recipe.ts
- packages/core/src/model/kitchen-recipe.test.ts
- packages/core/src/index.ts
<!-- SECTION:PLAN:END -->
