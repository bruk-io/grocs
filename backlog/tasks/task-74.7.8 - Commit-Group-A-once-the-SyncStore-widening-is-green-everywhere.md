---
id: TASK-74.7.8
title: Commit Group A once the SyncStore widening is green everywhere
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 02:27'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.7.4
  - TASK-74.7.5
  - TASK-74.7.6
  - TASK-74.7.7
parent_task_id: TASK-74.7
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §0.7. The SyncStore widening touches ports, both store providers and application tests, so it can only pass pre-commit as one commit. Following the c4db885 precedent, the orchestrator reviews and commits the shared worktree. This is a recorded decision-3 deviation, made with the reviewer's findings in hand.

Split key: orch-integrate-sync-store. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 One commit on main holds every Group A file, and pre-commit (checks, repo-wide typecheck, unit tests) passed without --no-verify
- [ ] #2 pnpm test:emulator passes for firestore-sync-store.emulator.test.ts, including syncStoreRecipeContract
- [ ] #3 Notes on TASK-74.7 record the deviation and the c4db885 precedent
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. From the repo root, run `git -C <shared worktree> status` and confirm only Group A's listed files changed.
2. Run `philosophy:reviewer` on the four Group A leaves and address its findings through the builders.
3. Run `pnpm -s typecheck`, `pnpm check`, `pnpm test` and `pnpm test:emulator` against the worktree (using `-C` or `--dir`, not `cd`).
4. Commit in the worktree with a message naming the four leaf ids and the Co-Authored-By line, then merge to main locally (do not push).
5. Add the deviation note to TASK-74.7 with the backlog CLI.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->
