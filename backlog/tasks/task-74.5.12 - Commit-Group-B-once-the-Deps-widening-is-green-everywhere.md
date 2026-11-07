---
id: TASK-74.5.12
title: Commit Group B once the Deps widening is green everywhere
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.5.10
  - TASK-74.5.11
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §0.7. Deps.recipeImporter breaks application tests and three apps/mobile sites at once, so the widening can only pass pre-commit as one commit (c4db885 precedent, a recorded decision-3 deviation).

Split key: orch-integrate-deps. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 One commit on main holds every Group B file, and pre-commit (checks, repo-wide typecheck, unit tests) passed without --no-verify
- [ ] #2 pnpm check:demo passes
- [ ] #3 Notes on TASK-74.5 record the deviation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Confirm with `git -C <shared worktree> status` that only Group B's listed files changed.
2. Run `philosophy:reviewer` on both Group B leaves and address its findings through the builders.
3. Run `pnpm -s typecheck`, `pnpm check`, `pnpm test` and `pnpm check:demo` against the worktree.
4. Commit with a message naming both leaf ids and the Co-Authored-By line, then merge to main locally (do not push).
5. Add the deviation note to TASK-74.5 with the backlog CLI.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->
