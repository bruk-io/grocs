---
id: TASK-74.5.5
title: FirebaseRecipeImporter calls only the importRecipe callable
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-providers
dependencies:
  - TASK-74.5.3
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §13. It mirrors FirebaseKitchenGateway's callable client. It does not depend on the callable to compile. The class and recipe-importer.emulator.test.ts land in one commit, because provider-runs-contract needs the test as soon as `implements RecipeImporter` exists. Emulator tests are not part of pre-commit. The orchestrator runs the emulator test after app-functions-callable (orch-emulator-suite). Every seeded URL is an already-normalised https://recipe.invalid/<unique path>, so a key mismatch fails as unreachable instead of fetching a real site. Covers TASK-74.5 AC#5 (the provider talks only to the import function) and TASK-74 AC#7.

Split key: providers-firebase-recipe-importer. Layer: providers. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 providers-firebase/src/recipe-importer.ts implements RecipeImporter with httpsCallable(instance, 'importRecipe') and nothing else, and is exported from index.ts
- [ ] #2 recipe-importer.emulator.test.ts runs recipeImporterContract against cache docs seeded through Admin writeRaw. The shapes come from contract §11, with schemaVersion 1 and failedAt Date.now(), and each key is the sha256 of the URL computed with node:crypto in the test. It adds an unauthenticated-rejects test
- [ ] #3 Every seeded or requested URL in the test uses host recipe.invalid, with no query, fragment or trailing slash, and no real domain appears in the file
- [ ] #4 The test imports nothing from providers-server. At this commit, pnpm -s typecheck passes repo-wide, and the orchestrator confirms pnpm check port-contracts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Write the client, then the emulator test with seeded docs and anonymous sign-in, in one commit.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- packages/providers-firebase/src/recipe-importer.ts
- packages/providers-firebase/src/recipe-importer.emulator.test.ts
- packages/providers-firebase/src/index.ts
<!-- SECTION:PLAN:END -->
