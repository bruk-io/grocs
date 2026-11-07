---
id: TASK-74.4.6
title: Firestore recipe cache and its emulator tests
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-74.4.5
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §10 and §11: FirestoreRecipeCache over Admin Firestore, with the three top-level collections. jsonLd is stored as a JSON string because Firestore cannot hold nested arrays, which departs from decision-15's 'raw object' wording, so the deviation is recorded. Emulator tests use adminFirestore() and a fake FetchPage serving fixtures. Every test uses a unique recipe.invalid URL, because the cache is shared and top-level. Covers TASK-74.4 AC#3 and AC#6, and decision-15's 'cache hit, miss, failure memory and each error'.

Split key: providers-recipe-cache. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FirestoreRecipeCache implements RecipeCache. saveRecipe writes recipes/{key} and recipeSources/{key} and deletes recipeFailures/{key} in one batch, with the doc shapes in contract §11. An undecodable doc reads as null
- [ ] #2 recipe-cache.emulator.test.ts runs importRecipe with FirestoreRecipeCache and covers: a miss stores both docs (read back raw, the recipe doc has no jsonLd and the source doc has no recipe); a hit makes no fetch; failure memory with an injected clock moved past 24 h; each error kind through the fake FetchPage (not-found, blocked, unreachable, not-a-recipe, incomplete-recipe), each stored in recipeFailures; invalid-url stores nothing; a source re-parse equals the stored recipe
- [ ] #3 Implementation notes on TASK-74.4 record the JSON-string storage of recipeSources.jsonLd as a deviation from decision-15, with the nested-array reason
- [ ] #4 Exported from providers-server/src/index.ts. At this commit, pnpm -s typecheck passes repo-wide, and orch-emulator-suite confirms pnpm test:emulator
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the class.
2. Write the emulator tests with unique URLs.
3. Add the deviation note.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-server/src/recipe/firestore-recipe-cache.ts
- packages/providers-server/src/recipe/recipe-cache.emulator.test.ts
- packages/providers-server/src/index.ts
<!-- SECTION:PLAN:END -->
