---
id: TASK-74.5.2
title: Rules for turning an import into a kitchen recipe and grocery lines
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:52'
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
1. Create packages/core/src/model/kitchen-recipe.ts exporting GroceryLine, recipeFromImport, recipeForLink and groceryLineFor exactly per contract §2: recipeFromImport sets id/addedBy/createdAt from parsed.recipeId and stamp, copies ParsedRecipe content fields, deleted null; recipeForLink filters out deleted recipes and matches exact sourceUrl, returns null for null link or no match; groceryLineFor sets name = item ?? line, amount = [quantity, unit] non-null parts joined by ' ', or null if both are null.
2. Write kitchen-recipe.test.ts covering: recipeFromImport (id=recipeId, addedBy/createdAt from stamp, deleted null, content unchanged), recipeForLink (exact match, skips deleted, null link -> null, no match -> null), groceryLineFor (item+quantity+unit -> '½ cup', quantity only, unit only, no quantity -> amount null, no item -> name=line).
3. Export the three functions and GroceryLine type from packages/core/src/index.ts.
4. Run pnpm -s typecheck and vitest --project unit packages/core; record output in task notes.

### Risks
Staying exactly inside contract §2 (decision-16); no scope beyond recipeFromImport/recipeForLink/groceryLineFor (recipe-doc, recipe-merge, SyncStore additions are other tasks). If the contract text is ambiguous I stop and write a note instead of guessing.

### Proof
vitest --project unit packages/core passing with the new test file, and pnpm -s typecheck passing repo-wide, output pasted into task notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/core/src/model/kitchen-recipe.ts (GroceryLine, recipeFromImport, recipeForLink, groceryLineFor per contract §2) with packages/core/src/model/kitchen-recipe.test.ts, and exported from packages/core/src/index.ts.

Proof:
- vitest --project unit packages/core: Test Files 14 passed (14), Tests 124 passed (124)
- pnpm -s typecheck: tsc --noEmit, no errors
<!-- SECTION:NOTES:END -->
