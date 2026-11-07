---
id: TASK-74.5.3
title: 'RecipeImporter port, fake and contract suite'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-ports
dependencies:
  - TASK-74.3.1
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §7. It follows the kitchen-gateway layout. A new port breaks nothing, so it commits on its own. The contract never needs a network fetch: its subject supplies a seeded known URL and a seeded remembered failure, both on recipe.invalid, plus an invalid URL. That lets FirebaseRecipeImporter run it through the Functions emulator. port-contracts mechanics: importRecipe is a method signature, contract.ts literally contains `.importRecipe(`, the function is named recipeImporterContract, and fake.test.ts calls it. Covers TASK-74.5 AC#5 (the contract test) and TASK-74 AC#7.

Split key: ports-recipe-importer. Layer: ports. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/ports/src/recipe-importer/ has port.ts, fake.ts, contract.ts and fake.test.ts, as in contract §7, all in one commit
- [ ] #2 FakeRecipeImporter returns the seeded outcome for a seeded URL, 'invalid-url' for a non-http(s) URL and 'not-a-recipe' for an unknown URL, and records calls
- [ ] #3 recipeImporterContract covers the four cases in contract §7. fake.test.ts runs it, using recipe.invalid URLs, plus fake-specific tests (calls are recorded; unknown → not-a-recipe)
- [ ] #4 index.ts exports the RecipeImporter type. test-support.ts exports FakeRecipeImporter, RecipeImportOutcome, recipeImporterContract and RecipeImporterSubject, none of which is on the main entry
- [ ] #5 At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/ports passes. The orchestrator confirms pnpm check port-contracts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write port.ts, then fake.ts, then contract.ts with the subject type, then fake.test.ts, which seeds the subject.
2. Add the exports.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/ports/src/recipe-importer/port.ts
- packages/ports/src/recipe-importer/fake.ts
- packages/ports/src/recipe-importer/contract.ts
- packages/ports/src/recipe-importer/fake.test.ts
- packages/ports/src/index.ts
- packages/ports/src/test-support.ts
<!-- SECTION:PLAN:END -->
