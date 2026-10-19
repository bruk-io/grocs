---
id: TASK-4
title: >-
  Something in the close path sets core.bare=true in the repo's .git/config,
  blocking every close
status: To Do
assignee: []
created_date: '2026-10-18 22:10'
updated_date: '2026-10-19 03:50'
labels:
  - size-1
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
During the review of TASK-1.8 the repository's own .git/config gained core.bare=true and a stray [user] section (t/t@example.com) mid-session, blocking scripts/close-task with 'its file has never been committed' even though git ls-files and git log showed the file tracked.

Root cause, confirmed by the orchestrator after the review: not the close path. A separate, long-running background workflow (launched earlier in the session, to review/close TASK-1.34/1.35/1.36 and redo TASK-1.33) had a TASK-1.33 agent working in an isolated worktree branched from main BEFORE TASK-1.36's fix was merged. That agent attempted a real `git commit`, which ran tools/hooks/hooks.test.ts's then-unfixed nested git fixture (the exact bug TASK-1.36 fixed) via lefthook's pre-commit `pnpm test` step. The fixture's `git init`/`git config user.name|email`/`git add -A`/`git commit` leaked into the repo's shared .git/config (common across every worktree) at the same time the TASK-1.8 reviewer was running close-task, which is why no test suite appeared to run "in the close path" - the test suite that corrupted things was running concurrently, in a different worktree, for a different task.

This is not a second bug: it's the same TASK-1.36 bug recurring in a worktree that predated the fix. The real lesson is operational, not code: a long-running background agent (via the Workflow tool's isolation:'worktree') can hold a stale, pre-fix snapshot of the repo for as long as it runs, and nothing currently detects or warns that a fix merged to main after a worktree was created hasn't reached that worktree.

Updated acceptance criteria reflect this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No currently-running agent or worktree holds a pre-TASK-1.36 copy of tools/hooks/hooks.test.ts or tools/checks/run.ts
- [x] #2 CLAUDE.md's agent-delegation guidance (or decision-3) says a long-running isolation:'worktree' agent must be refreshed against main before it commits, so a fix merged mid-run doesn't miss a worktree branched before it
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
No repro: this was an operational/environmental corruption (a stale pre-fix worktree's test run leaking into the shared .git/config), not a deterministic code-level failure with a test to point at. The underlying bug has its own repro and fix recorded on TASK-1.36 (closed). This task's two ACs are a verification check (AC1) and a documentation note (AC2), not a code change with a failing test.
<!-- SECTION:NOTES:END -->
