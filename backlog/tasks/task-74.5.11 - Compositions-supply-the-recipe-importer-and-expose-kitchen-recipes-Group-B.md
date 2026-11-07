---
id: TASK-74.5.11
title: Compositions supply the recipe importer and expose kitchen recipes - Group B
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
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
1. Add the App method.
2. Wire each composition and appOnFakes.
3. Run the app tests and write the hand-off note.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- apps/mobile/src/composition/compose-app.ts
- apps/mobile/src/composition/compose-firebase.ts
- apps/mobile/src/demo/compose-demo.ts
- apps/mobile/src/demo/recipes.ts
- apps/mobile/testing/render-route.tsx
<!-- SECTION:PLAN:END -->
