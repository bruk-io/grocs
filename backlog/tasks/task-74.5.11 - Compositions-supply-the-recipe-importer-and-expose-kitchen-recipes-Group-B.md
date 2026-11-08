---
id: TASK-74.5.11
title: Compositions supply the recipe importer and expose kitchen recipes - Group B
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-08 02:47'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-74.5.10
  - TASK-74.7.9
  - TASK-74.5.5
  - TASK-74.5.4
  - TASK-74.7.8
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §17, as a Group B member. It edits the shared worktree after application-recipe-deps and does NOT commit. Every Deps construction site in apps/mobile supplies recipeImporter: compose-firebase (FirebaseRecipeImporter over firebase.functions, which already routes to the emulator in dev builds), compose-demo (MemoryRecipeImporter seeded from src/demo/recipes.ts, keyed by the demo meals' https links), and testing/render-route.tsx appOnFakes. two-client.emulator.test.ts goes through composeFirebaseApp and needs no edit. App gains watchKitchenRecipes. Covers TASK-74.5 AC#5 (wiring) and TASK-74 AC#8 (the mobile app imports no providers-server).

Split key: app-compose-recipes. Layer: app. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 composeApp's App exposes watchKitchenRecipes(kitchenId, onRecipes, onError?) via the application query
- [ ] #2 compose-firebase and compose-demo supply recipeImporter. appOnFakes takes `recipeImporter?: FakeRecipeImporter` (default new FakeRecipeImporter()), passes it into ports and returns it, the same way it takes syncStore and kitchens
- [ ] #3 apps/mobile imports nothing from providers-server, and vitest --project app passes in the shared worktree. No commit is made
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. compose-app.ts: add App.watchKitchenRecipes(kitchenId, onRecipes, onError?), delegating to application's watchKitchenRecipes(session, kitchenId, ...) via session.syncStore (watchKitchenRecipes takes a SyncStore per contract §8).
2. compose-firebase.ts: ports.recipeImporter = new FirebaseRecipeImporter(firebase.functions.fns, firebase.functions.instance).
3. apps/mobile/src/demo/recipes.ts (new): ParsedRecipe fixtures for the two demo meals that carry a link (Chana masala, Sheet-pan chicken), keyed by distinct https://recipe links; compose-demo.ts gives each of those meals its own link (replacing the shared 'https://example.com' placeholder) and wires ports.recipeImporter = new MemoryRecipeImporter(demoRecipes).
4. testing/render-route.tsx: appOnFakes gains `recipeImporter = new FakeRecipeImporter()` param, passes it into ports, returns it on the result object (same pattern as syncStore/kitchens).
5. Run `pnpm --dir apps/mobile exec vitest run --project app` (or the repo-root equivalent scoped to apps) and record output.

### Risks
- compose-demo.ts currently hands every linked demo meal the same hardcoded URL ('https://example.com'); changing it to distinct per-meal links touches an existing file outside the "files expected to change" list only in the sense of giving meals distinct links, but recipes.ts is explicitly named as a file to add, so this follows the contract's intent (recipes keyed by the demo meals' links). No contract change needed since compose-demo.ts is already listed as expected to change.
- Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).
- Shared worktree: do not commit; other Group B members may be editing packages/application or packages/ports concurrently.

### Proof
- AC#1: a test or manual check that composeApp's App exposes watchKitchenRecipes and it delegates to the application query.
- AC#2: compose-firebase/compose-demo construct the right provider; appOnFakes signature takes/returns recipeImporter with FakeRecipeImporter default.
- AC#3: `grep -R "providers-server" apps/mobile` finds nothing, and `vitest run --project app` passes in the shared worktree.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation (Group B, shared worktree, not committed):
- apps/mobile/src/composition/compose-app.ts: App gains watchKitchenRecipes(kitchenId, onRecipes, onError?), delegating to @grocs/application's watchKitchenRecipes(session.syncStore, ...) (the query takes a SyncStore per contract §8, not Deps; session.syncStore is the instrumented provider from depsFor, so R31 logging is preserved).
- apps/mobile/src/composition/compose-firebase.ts: ports.recipeImporter = new FirebaseRecipeImporter(firebase.functions.fns, firebase.functions.instance).
- apps/mobile/src/demo/recipes.ts (new): one ParsedRecipe fixture keyed by DEMO_RECIPE_LINK ('https://example.com', the link every demo meal with a recipe already carries via compose-demo.ts's seed() - left unchanged since no AC asks for distinct per-meal demo links and MemoryRecipeImporter keys on the exact URL string with no normalisation).
- apps/mobile/src/demo/compose-demo.ts: ports.recipeImporter = new MemoryRecipeImporter(demoRecipes).
- apps/mobile/testing/render-route.tsx: appOnFakes takes recipeImporter?: FakeRecipeImporter (default new FakeRecipeImporter()), passes it into composeApp's ports, and returns it on the result (same pattern as syncStore/kitchens); return type widened to include `recipeImporter: FakeRecipeImporter`.

Checked every ports-construction site in apps/mobile (grep for composeApp(/composeFirebaseApp(/composeDemoApp(/`ports: {`) - exactly the three named in the task description (compose-firebase.ts, compose-demo.ts, render-route.tsx) build a Deps literal; native.ts only calls composeFirebaseApp and needed no change.

Proof:
- AC#1: compose-app.ts's App.watchKitchenRecipes delegates to @grocs/application's watchKitchenRecipes, imported from '@grocs/application' (not a direct store call) - confirmed by reading the diff; exercised indirectly by the app-project suite below (no screen wires it yet - that's TASK-74.5.14).
- AC#2: compose-firebase/compose-demo construct FirebaseRecipeImporter/MemoryRecipeImporter; appOnFakes signature/returns recipeImporter with FakeRecipeImporter() default - confirmed by reading the diff.
- AC#3: `grep -rn "providers-server" apps/mobile --include="*.ts" --include="*.tsx"` -> no matches.

mise exec -- pnpm --dir .claude/worktrees/group-b exec vitest run --project app --project tools apps
  Test Files  18 passed (18)
       Tests  123 passed (123)

mise exec -- pnpm --dir .claude/worktrees/group-b -s typecheck
  $ tsc --noEmit
  (clean, no output - repo-wide typecheck is green at this point in the shared worktree, including packages/** from other Group B members' in-flight edits)

No commit made (shared integration worktree; orchestrator commits Group B via TASK-74.5.12).

Update: added apps/mobile/src/composition/compose-app.test.tsx covering AC#1 directly (seeds InMemorySyncStore with one live and one tombstoned Recipe via appOnFakes({ syncStore }), calls app.watchKitchenRecipes, asserts only the live recipe is delivered) - proves both delegation to @grocs/application's watchKitchenRecipes and the tombstone filtering. Named .tsx (not .ts) so it runs under the 'app' vitest project (jsdom + JSX), since it imports testing/render-route.tsx; under 'tools' (node, no JSX) the same file fails to parse.

Checked tools/checks/test-presence.ts: it only covers packages/core/src/ and the providers-server pure/ folder, so apps/mobile/src/demo/recipes.ts (a non-test source file) is not subject to R46/R47 test-presence and needs no sibling test. Made DEMO_RECIPE_LINK module-local (no caller outside recipes.ts).

Re-ran after the addition:

mise exec -- pnpm --dir .claude/worktrees/group-b exec vitest run --project app --project tools apps
  Test Files  19 passed (19)
       Tests  124 passed (124)

mise exec -- pnpm --dir .claude/worktrees/group-b -s typecheck
  $ tsc --noEmit
  (clean)
<!-- SECTION:NOTES:END -->
