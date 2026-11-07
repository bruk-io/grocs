---
id: TASK-74.4.7
title: importRecipe callable in apps/functions
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-2
  - layer-app
dependencies:
  - TASK-74.4.6
  - TASK-74.3.2
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §12. Only signed-in callers may call it. Results come back as data, never as thrown errors carrying a URL, because onCall logs uncaught messages (R36). The code stays type-strippable: no enums, namespaces or parameter properties, and .ts specifiers. It imports only providers-server (import-layers/app-providers). Seeded URLs use recipe.invalid, so no real site is ever fetched. Covers TASK-74.4 AC#1 and AC#8, and TASK-74 AC#7 and AC#13 (it runs in the emulator).

Split key: app-functions-callable. Layer: app. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 apps/functions/src/index.ts exports importRecipe = onCall(...), wired to createLiveFetchPage, FirestoreRecipeCache(getFirestore()) and Date.now
- [ ] #2 apps/functions/src/import-recipe.emulator.test.ts calls the callable over HTTP. It covers: unauthenticated is rejected; a missing url gives invalid-argument; 'not a link' returns {ok:false,error:'invalid-url'} as data; an Admin-seeded recipes/{key} entry for an already-normalised https://recipe.invalid/<unique> URL is returned. No real domain appears in the test
- [ ] #3 Logging is by error kind only, with no URL. At this commit, pnpm -s typecheck passes repo-wide, and orch-emulator-suite confirms pnpm test:emulator
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Add the callable.
2. Add the emulator test, seeding through adminFirestore().

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- apps/functions/src/index.ts
- apps/functions/src/import-recipe.emulator.test.ts
<!-- SECTION:PLAN:END -->
