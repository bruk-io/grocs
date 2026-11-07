---
id: TASK-74.3.1
title: Recipe contract types in core
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - layer-core
dependencies: []
parent_task_id: TASK-74.3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Lands decision-15's shared contract and decision-16's record type, as in contract §1. The file is types only, so test-presence does not apply. Every other task imports these types, so this one goes first. Covers TASK-74.3 (the contract part of decision-15's consequences) and the Recipe record type for TASK-74.7.

Split key: core-recipe-contract. Layer: core. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/core/src/model/recipe.ts exports exactly the types ParsedIngredient, ParsedRecipe, RecipeImportError and Recipe, with the fields and doc comments in contract §1, and no functions, consts or other values
- [ ] #2 packages/core/src/index.ts re-exports the four with `export type`
- [ ] #3 At this commit, mise exec -- pnpm -s typecheck passes repo-wide and mise exec -- pnpm exec vitest run --project unit packages/core passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Create packages/core/src/model/recipe.ts. Line 1 is the comment `// The recipe-import contract shared by the apps and the server (decision-15), and the kitchen record (decision-16). Types only.` Line 2 is `import type { Stamp } from '../merge/lww.ts';`. Line 3 is blank.
2. Add `/** One ingredient line. `line` is the source of truth; the parsed parts are best effort. */` and then `export interface ParsedIngredient {`, with these four members, each preceded by its doc comment: `/** As written, trimmed, non-empty. */ readonly line: string;` then `/** As written in the line, e.g. '1 1/2', '½', '2-3'; null when the line has none. */ readonly quantity: string | null;` then `/** As written, e.g. 'cup', 'tbsp', '(14-ounce) can'; null when the line has none. */ readonly unit: string | null;` then `/** The thing to buy, e.g. 'chickpeas'; null when it cannot be told apart. */ readonly item: string | null;`. Close the interface with `}`.
3. Add `/** What the import function returns. recipeId = server cache key (sha256 hex of sourceUrl). */` and then `export interface ParsedRecipe {`, with these members, one per line: `readonly recipeId: string;` then `/** The normalised URL (contract section 9). */ readonly sourceUrl: string;` then `/** Non-empty. */ readonly title: string;` then `/** e.g. '4 servings'; a number or a list is normalised to one string. */ readonly yield: string | null;` then `/** At least one, flattened from HowToSection. */ readonly steps: readonly string[];` then `/** At least one. */ readonly ingredients: readonly ParsedIngredient[];` then `/** Absolute URL. */ readonly image: string | null;`. Close with `}`.
4. Add `/** Why an import failed (decision-15). */` and then `export type RecipeImportError = 'invalid-url' | 'not-found' | 'blocked' | 'unreachable' | 'not-a-recipe' | 'incomplete-recipe';`.
5. Add `/** A kitchen record at kitchens/{kitchenId}/recipes/{id} (decision-16). Content is written once and never restamped. */` and then `export interface Recipe {`, with these members, one per line: `/** Equals ParsedRecipe.recipeId. */ readonly id: string;` then `readonly addedBy: string;` then `readonly createdAt: number;` then `readonly sourceUrl: string;` then `readonly title: string;` then `readonly yield: string | null;` then `readonly steps: readonly string[];` then `readonly ingredients: readonly ParsedIngredient[];` then `readonly image: string | null;` then `/** Once set it stays (R20). */ readonly deleted: Stamp | null;`. Close with `}`.
6. Do not add any `const`, `function` or `RECIPE_IMPORT_ERRORS` to this file.
7. In packages/core/src/index.ts, find the line that exports the meal types. Directly after it, add `export type { ParsedIngredient, ParsedRecipe, Recipe, RecipeImportError } from './model/recipe.ts';`.
8. Run `mise exec -- pnpm -s typecheck` and `mise exec -- pnpm exec vitest run --project unit packages/core`. Both must pass. If either fails outside packages/core, stop and report in the task notes. Do not edit other packages.
9. Commit with a message naming this leaf task id.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/core/src/model/recipe.ts
- packages/core/src/index.ts
<!-- SECTION:PLAN:END -->
