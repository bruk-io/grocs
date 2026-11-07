---
id: TASK-74.5.5
title: FirebaseRecipeImporter calls only the importRecipe callable
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:35'
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
1. Add `packages/providers-firebase/src/recipe-importer.ts`: `FirebaseRecipeImporter implements RecipeImporter`, mirroring FirebaseKitchenGateway's callable-client shape (constructor(fns: FunctionsFns, functionsInstance: unknown); importRecipe(url) calls httpsCallable<{url:string}, Result<ParsedRecipe, RecipeImportError>>(instance, 'importRecipe')({url}) and returns .data). No other SDK surface used.
2. Export it from `packages/providers-firebase/src/index.ts`.
3. Add `packages/providers-firebase/src/recipe-importer.emulator.test.ts`: run `recipeImporterContract` from `@grocs/ports/testing` against a subject built by signing in anonymously and seeding `recipes/{key}` (known) and `recipeFailures/{key}` (remembered) docs via Admin `writeRaw`, each key the sha256 hex (node:crypto, computed in the test - no import from providers-server) of an already-normalised `https://recipe.invalid/<unique path>` URL. Seeded shapes follow contract §11 (schemaVersion 1, fetchedAt/failedAt Date.now()). Add a separate `describe` block for an unauthenticated-rejects case (no sign-in, importRecipe rejects).
4. Both files land in one commit (provider + its test), per the task description.
5. Run `pnpm -s typecheck` repo-wide and the providers-firebase unit-test project (the emulator test itself needs the Functions emulator and the not-yet-built importRecipe callable - TASK-74.4.7 - so it is not run here; the orchestrator runs it later via orch-emulator-suite per TASK-74.5.9). Record output in notes.

### Risks
- The importRecipe Cloud Function (TASK-74.4.7) does not exist yet, so the emulator test cannot actually execute end-to-end in this task; only typecheck and static shape are verifiable here, matching the contract's note that the orchestrator runs this suite after app-functions-callable.
- If any part of §13 or §11 needs to change, that goes in this task's notes and the task stops (decision-3 mediation) rather than improvising.

### Proof
- `pnpm -s typecheck` passes repo-wide (AC#4).
- Source review: recipe-importer.ts has only the constructor and one httpsCallable('importRecipe') call (AC#1); it is exported from index.ts (AC#1).
- Source review: the emulator test imports recipeImporterContract, seeds via writeRaw with sha256 keys computed inline, uses only host recipe.invalid with no query/fragment/trailing slash, and adds an unauthenticated-rejects test (AC#2, AC#3); grep confirms no import from providers-server and no real domain string (AC#3, AC#4).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented FirebaseRecipeImporter (packages/providers-firebase/src/recipe-importer.ts), exported from index.ts, and recipe-importer.emulator.test.ts in one commit, per the plan.

AC#1: recipe-importer.ts implements RecipeImporter via one httpsCallable(instance, 'importRecipe') call, nothing else (constructor stores fns/functionsInstance only); exported from index.ts.

AC#2/#3: recipe-importer.emulator.test.ts runs recipeImporterContract against cache docs seeded through Admin writeRaw (recipes/{key} and recipeFailures/{key}, schemaVersion 1, fetchedAt/failedAt Date.now()), keys computed with node:crypto sha256 over already-normalised https://recipe.invalid/<path> URLs (no query/fragment/trailing slash, no real domain anywhere in the file - confirmed by grep). A separate describe block adds an unauthenticated-rejects test.

AC#4: no import from providers-server (grep confirms only a comment mentions the name). `pnpm -s typecheck` passes repo-wide:
$ mise exec -- pnpm -s typecheck
$ tsc --noEmit
(no errors)

Note: the importRecipe Cloud Function itself (TASK-74.4.7) is not yet built, so this emulator test cannot actually run end-to-end yet; per the task description the orchestrator runs it after app-functions-callable (orch-emulator-suite, TASK-74.5.9). providers-firebase has no unit-test project match for this file (it's *.emulator.test.ts, excluded from the `unit` vitest project by design), so `pnpm exec vitest run --project unit packages/providers-firebase` reports no test files - expected, not a failure. The orchestrator still needs to run `pnpm check port-contracts` repo-wide (outside this layer's narrowed Bash) to confirm AC#4's second half.
<!-- SECTION:NOTES:END -->
