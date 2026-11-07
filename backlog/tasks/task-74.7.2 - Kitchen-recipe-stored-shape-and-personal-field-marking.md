---
id: TASK-74.7.2
title: Kitchen recipe stored shape and personal-field marking
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:54'
labels:
  - size-2
  - layer-core
dependencies:
  - TASK-74.3.1
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §3 and §5. Content is stored plain, not as {v,at,by}, because decision-16 never restamps it. SchemaError is imported from ./item-doc.ts. Nothing outside core changes, so the commit is green on its own. Covers TASK-74.7 AC#1.

Split key: core-recipe-doc. Layer: core. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 schema/recipe-doc.ts exports RECIPE_SCHEMA_VERSION = 1, RecipeDoc, encodeRecipe and decodeRecipe as in contract §3
- [ ] #2 recipe-doc.test.ts covers: schema version 1 is carried; round-trips, including through JSON; a fast-check round-trip; an unknown version is rejected with 'unsupported-version'; a table of bad documents asserts error.path (including 'steps.1', 'ingredients.0.line' and 'deleted.at')
- [ ] #3 personal.ts has the recipe and ingredient entries from contract §5. personal.test.ts shows no title, URL, image, ingredient or step string leaks from a domain Recipe, a RecipeDoc or a bare ParsedRecipe; recipe docs are not classified as item or meal; and the new attribute keys (recipeTitle, recipeSourceUrl, recipeImage, ingredientLine and the rest) are redacted
- [ ] #4 Exports are added to packages/core/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/core passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. packages/core/src/schema/recipe-doc.ts: RECIPE_SCHEMA_VERSION=1, RecipeDoc (plain fields per contract §3, no {v,at,by}), encodeRecipe, decodeRecipe (bad/isObject/readField-style helpers mirroring meal-doc.ts, adapted for plain fields and the ingredients array), importing SchemaError from ./item-doc.ts.
2. recipe-doc.test.ts: schema version carried; round-trip incl. JSON; fast-check round-trip over title/yield/steps/ingredients/image; unsupported-version rejected; bad-document table asserting error.path including 'steps.1', 'ingredients.0.line', 'deleted.at'.
3. packages/core/src/schema/personal.ts: add the 'recipe' entry (shape ['sourceUrl','ingredients'], personal ['title','sourceUrl','ingredients','steps','image']) and the 'ingredient' entry (shape ['line','item'], personal ['line','quantity','unit','item']) per contract §5, placed after meal/item so no existing shape matches a recipe doc first.
4. personal.test.ts additions: no title/URL/image/ingredient/step leaks from a domain Recipe, a RecipeDoc, and a bare ParsedRecipe; recipe docs classify as 'recipe' not 'item'/'meal'; new attribute keys (recipeTitle, recipeSourceUrl, recipeImage, ingredientLine, etc.) are redacted.
5. Add RecipeDoc/encodeRecipe/decodeRecipe/RECIPE_SCHEMA_VERSION exports to packages/core/src/index.ts.
6. Run vitest --project unit packages/core and pnpm -s typecheck; record output in notes.

### Risks
Staying inside packages/core only; no change to recipe.ts (TASK-74.3.1, already on main) or to other layers. If the contract's exact field list or shape keys turn out inconsistent with what's needed, that is a stop-and-ask per decision-3, not an improvisation.

### Proof
Each AC is shown by a passing test in recipe-doc.test.ts / personal.test.ts and by vitest + typecheck output pasted into the task notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation

- packages/core/src/schema/recipe-doc.ts: RECIPE_SCHEMA_VERSION=1, RecipeDoc (plain fields, no {v,at,by} per decision-16), encodeRecipe, decodeRecipe (path-naming errors mirroring meal-doc.ts/item-doc.ts).
- packages/core/src/schema/recipe-doc.test.ts: schema-version check; round-trip incl. JSON; fast-check round-trip over title/yield/steps/ingredients/image; unsupported-version rejection; bad-document table asserting error.path for 'steps.1', 'ingredients.0.line', 'deleted.at' and others.
- packages/core/src/schema/personal.ts: added 'recipe' (shape ['sourceUrl','ingredients'], personal ['title','sourceUrl','ingredients','steps','image']) and 'ingredient' (shape ['line','item'], personal ['line','quantity','unit','item']) entries after meal/item (no shape overlap).
- packages/core/src/schema/personal.test.ts: redaction tests for a domain Recipe, a RecipeDoc and a bare ParsedRecipe (no title/URL/image/ingredient/step leaks); a bare ParsedIngredient; classification of recipe docs as 'recipe' not 'item'/'meal'; new attribute keys (recipeTitle, recipeSourceUrl, recipeImage, ingredientLine) redacted.
- packages/core/src/index.ts: exports RecipeDoc, encodeRecipe, decodeRecipe, RECIPE_SCHEMA_VERSION.

## Proof

`mise exec -- pnpm exec vitest run --project unit packages/core`:
```
 Test Files  14 passed (14)
      Tests  123 passed (123)
```

`mise exec -- pnpm -s typecheck`:
```
$ tsc --noEmit
```
(exits 0, no output)
<!-- SECTION:NOTES:END -->
