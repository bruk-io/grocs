---
id: TASK-74.5.3
title: 'RecipeImporter port, fake and contract suite'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:23'
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
- [x] #1 packages/ports/src/recipe-importer/ has port.ts, fake.ts, contract.ts and fake.test.ts, as in contract §7, all in one commit
- [x] #2 FakeRecipeImporter returns the seeded outcome for a seeded URL, 'invalid-url' for a non-http(s) URL and 'not-a-recipe' for an unknown URL, and records calls
- [x] #3 recipeImporterContract covers the four cases in contract §7. fake.test.ts runs it, using recipe.invalid URLs, plus fake-specific tests (calls are recorded; unknown → not-a-recipe)
- [x] #4 index.ts exports the RecipeImporter type. test-support.ts exports FakeRecipeImporter, RecipeImportOutcome, recipeImporterContract and RecipeImporterSubject, none of which is on the main entry
- [x] #5 At this commit, pnpm -s typecheck passes repo-wide and vitest --project unit packages/ports passes. The orchestrator confirms pnpm check port-contracts
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. port.ts: RecipeImporter interface, importRecipe(url) -> Promise<Result<ParsedRecipe, RecipeImportError>>, per contract §7.
2. fake.ts: RecipeImportOutcome = ParsedRecipe | RecipeImportError; FakeRecipeImporter(entries?) with #calls, #entries map keyed by exact seeded URL string; importRecipe returns ok(outcome) when outcome looks like a ParsedRecipe, err(outcome) when it is a RecipeImportError string; non-http(s)/unparseable URL -> err('invalid-url'); unknown URL -> err('not-a-recipe').
3. contract.ts: RecipeImporterSubject (importer, known {url, recipeId, title}, remembered {url, error}, invalidUrl, dispose?) and recipeImporterContract(t, make) covering the four cases in contract §7 (known twice gives same recipeId; remembered -> err(remembered.error); invalidUrl -> err('invalid-url')), calling .importRecipe( literally.
4. fake.test.ts: calls recipeImporterContract seeding known/remembered with recipe.invalid host URLs, plus fake-specific tests (calls recorded in order; unknown url -> not-a-recipe).
5. Export RecipeImporter type from index.ts; export FakeRecipeImporter, RecipeImportOutcome, recipeImporterContract, RecipeImporterSubject from test-support.ts only.

### Risks
Follow TASK-74's slice contract (§7) exactly; if a needed contract change surfaces, record it in this task's notes and stop with status blocked (decision-3 mediation). Keep SDK vocabulary out of the port per ports-describe-intent.

### Proof
- pnpm -s typecheck passes repo-wide (AC#5)
- vitest --project unit packages/ports passes, covering fake.test.ts (AC#2, #3)
- grep for file layout and literal `.importRecipe(` in contract.ts (AC#1, #3)
- index.ts / test-support.ts export check (AC#4)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/ports/src/recipe-importer/{port.ts,fake.ts,contract.ts,fake.test.ts} per contract §7, exported from index.ts (RecipeImporter type only) and test-support.ts (FakeRecipeImporter, RecipeImportOutcome, recipeImporterContract, RecipeImporterSubject).

Proof:
- `mise exec -- pnpm exec vitest run --project unit packages/ports` -> Test Files 7 passed (7), Tests 64 passed (64).
- `mise exec -- pnpm -s typecheck` -> `$ tsc --noEmit` with no errors (repo-wide, clean exit).
- contract.ts literally calls `.importRecipe(` and exports `recipeImporterContract`; fake.test.ts calls `recipeImporterContract(...)` seeding known/remembered URLs on host recipe.invalid, plus FakeRecipeImporter-specific tests for recorded calls and an unknown URL returning 'not-a-recipe'.
- `pnpm check port-contracts` not run here (outside this layer's narrowed Bash); left for the orchestrator per the task text.

Checked tools/checks/port-contracts.ts directly (read-only, no Bash run needed): port-contracts/provider-runs-contract only scans files under packages/providers-*/ for `class X implements <PortInterface>` and requires a test there calling the contract. No provider implements RecipeImporter yet (MemoryRecipeImporter is TASK-74.5.4, FirebaseRecipeImporter is TASK-74.5.5), so that rule cannot fire against this commit. The other three rules it enforces are satisfied: port-files (port.ts/fake.ts/contract.ts/fake.test.ts all present), method-covered (contract.ts matches `.importRecipe(`), fake-runs-contract (fake.test.ts contains `recipeImporterContract(`). This confirms the task description's "a new port breaks nothing, so it commits on its own" for AC#5's port-contracts part; the orchestrator can still run `pnpm check port-contracts` for the authoritative pass.

Also tightened fake.ts: merged the two @grocs/core imports into one type import, and made `get calls()` return a defensive copy ([...this.#calls]) so the readonly string[] type is honest.

Closed by reviewer. AC1: 25ccf16 adds port.ts, fake.ts, contract.ts, fake.test.ts together (0ccf963 later tidies fake.ts only). AC2-3: fake and contract cover known/twice-same-id/remembered/invalid-url, fake.test.ts runs the contract on recipe.invalid URLs plus calls-recorded and unknown->not-a-recipe; vitest --project unit packages/ports 64 passed. AC4: index.ts exports RecipeImporter type only; the four test-support exports are present and absent from index. AC5: orchestrator's typecheck clean on 6b8e90f; pnpm check port-contracts passed here. Findings (low, no task): contract case 3/4 assert result.ok before the narrowing throw - redundant but harmless; fake matches seeded URLs before validating, so seeding an invalid URL would bypass invalid-url - test-only, acceptable.
<!-- SECTION:NOTES:END -->
