---
id: TASK-74.5.9
title: Run the emulator suites for the recipe providers and callable
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 05:04'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.4.7
  - TASK-74.5.5
  - TASK-74.4.6
  - TASK-74.7.8
  - TASK-74.4.2
  - TASK-74.7.1
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Builders cannot run pnpm test:emulator or pnpm check. This task is the one place their emulator ACs are confirmed: FirebaseRecipeImporter's contract through the real callable (TASK-74.5 AC#5), the cache, the callable, the kitchen recipes store and the rules.

Split key: orch-emulator-suite. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 pnpm test:emulator passes on main, including recipe-importer.emulator.test.ts, recipe-cache.emulator.test.ts, import-recipe.emulator.test.ts and firestore-sync-store.emulator.test.ts
- [ ] #2 The functions emulator log shows no outbound request to any host other than recipe.invalid during the run
- [ ] #3 pnpm check passes, and the result is recorded in the TASK-74.4 and TASK-74.5 notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. From the repo root, run `pnpm test:emulator` and save the output to the scratchpad.
2. Grep the functions emulator log for 'http' hosts and confirm that only recipe.invalid appears, or nothing at all.
3. Run `pnpm check`.
4. Record the pass counts in the TASK-74.4 and TASK-74.5 notes with the backlog CLI, then commit the board to main locally (do not push).

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->
