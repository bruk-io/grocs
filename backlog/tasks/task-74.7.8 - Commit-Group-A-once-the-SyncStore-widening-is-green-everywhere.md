---
id: TASK-74.7.8
title: Commit Group A once the SyncStore widening is green everywhere
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 04:20'
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
- [x] #1 One commit on main holds every Group A file, and pre-commit (checks, repo-wide typecheck, unit tests) passed without --no-verify
- [x] #2 pnpm test:emulator passes for firestore-sync-store.emulator.test.ts, including syncStoreRecipeContract
- [x] #3 Notes on TASK-74.7 record the deviation and the c4db885 precedent
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Review (philosophy:reviewer, 2026-11-06): NOT CLOSED. AC#1 met: 6bcb2fc holds all 14 Group A files (port, fake, contract, memory + Firestore stores, emulator test, add-item scenario, four leaf tasks); its message records check 16, typecheck, 2033 unit tests, and no evidence of --no-verify. AC#2 met on the orchestrator's emulator run (128 passed; the 4 failures are all recipe-importer.emulator.test.ts, owned by TASK-74.4.7/74.5.9). AC#3 UNMET: TASK-74.7 has no implementation notes and no mention of the deviation or c4db885 (grep of backlog/tasks finds c4db885 only in TASK-74, 74.5.12, 74.7.8 and TASK-1.21.x). To close: append a note on TASK-74.7 recording the decision-3 deviation (shared worktree, orchestrator commit, agreed by Bruk 2026-11-07) and the c4db885 precedent, then re-review. No drafts filed.

Re-review (philosophy:reviewer): CLOSED. AC#1 and AC#2 were met and ticked on the earlier review (6bcb2fc holds all Group A files, pre-commit passed; emulator firestore-sync-store suite incl. syncStoreRecipeContract passed). AC#3 now met: TASK-74.7 implementation notes record the decision-3 deviation (shared worktree .claude/worktrees/group-a, orchestrator commit 6bcb2fc merged in 6242c0b, agreed by Bruk 2026-11-07) and the c4db885 precedent (TASK-1.21.2/.3/.4). Main at ca542a3: pnpm check 16 passed, typecheck clean, 2061 unit tests passed (orchestrator evidence). No findings, no drafts filed.
<!-- SECTION:NOTES:END -->
