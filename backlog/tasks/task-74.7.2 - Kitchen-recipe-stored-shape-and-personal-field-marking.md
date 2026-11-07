---
id: TASK-74.7.2
title: Kitchen recipe stored shape and personal-field marking
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
1. Mirror meal-doc.ts's helpers locally (bad, isObject, readField) for plain fields.
2. Write encode and decode, then the tests.
3. Add the personal entries, placed so that no existing entry's shape matches recipe docs first, then their tests.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/core/src/schema/recipe-doc.ts
- packages/core/src/schema/recipe-doc.test.ts
- packages/core/src/schema/personal.ts
- packages/core/src/schema/personal.test.ts
- packages/core/src/index.ts
<!-- SECTION:PLAN:END -->
