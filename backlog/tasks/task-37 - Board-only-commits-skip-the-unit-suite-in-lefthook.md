---
id: TASK-37
title: Board-only commits skip the unit suite in lefthook
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-21 11:06'
updated_date: '2026-10-21 11:07'
labels: []
dependencies: []
modified_files:
  - tools/hooks/unit-tests.ts
  - tools/hooks/unit-tests.test.ts
  - lefthook.yml
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From Bruk directly. A commit that touches only backlog/** (a status change, a plan, a note) cannot break a test, so running the whole suite for one is only cost - and today's stale-lock/slow-hook problem (TASK-35's philosophy-plugin fix) compounds with every full-suite run on a loaded machine. Checks and typecheck still run unconditionally; only the unit-test step is conditional, and only when every staged file is under backlog/.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 lefthook.yml's unit-tests step skips pnpm test when every staged file is under backlog/, and runs it as before otherwise
- [x] #2 A unit test covers both the skip and the don't-skip decision
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. New file tools/hooks/unit-tests.ts: the lefthook pre-commit entry point. Reads the staged file list (git diff --cached --name-only, with the same GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_CEILING_DIRECTORIES stripping run.ts already uses, so a test fixture via GROCS_ROOT is never pointed at the real repository instead, TASK-1.36). isBoardOnly(files) is exported and pure: true only when there is at least one staged file and every one starts with backlog/. When true, print a skip message and exit 0 without running pnpm test; otherwise spawn pnpm -s test and forward its exit code. Guard main() behind the usual process.argv[1] === this file check so importing the module for its exports (tests) never runs it.
2. lefthook.yml's unit-tests command becomes node tools/hooks/unit-tests.ts, with a one-line comment saying why.
3. tools/hooks/unit-tests.test.ts: unit tests for isBoardOnly covering all-backlog, mixed, empty, and a near-miss path (backlog.md, no slash) that must not be treated as board-only.

### Risks
Scoped to lefthook only - CI's own pnpm test step and the Stop hook (tools/hooks/stop.ts, a different end-of-turn check with no staged-file concept) are both untouched, since CI validates an accumulated diff that can span many commits and the Stop hook validates working-tree state generally, not what one commit touches.

### Proof
Verified live against the real repo: staging only a backlog/ file prints the skip message and exits 0 without running pnpm test; reverting that and running normally still runs the suite. pnpm check/typecheck/test all pass.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented and verified live against the real repo (approved by Bruk in chat before implementing): staging only a backlog/ file and running node tools/hooks/unit-tests.ts directly printed 'unit-tests: skipped, every staged file is under backlog/' and exited 0 without running pnpm test; reverted that and confirmed the normal path still runs the suite. Caught and fixed one real bug while writing the test: main() was called unconditionally at module load, so importing unit-tests.ts for its isBoardOnly export (the test file itself) ran the full real pnpm test suite and called process.exit() as a side effect of import - guarded behind the same process.argv[1] check tools/hooks/run.ts and launch-guard.ts already use. pnpm check (14 checks), typecheck, and the new unit test file all pass.
<!-- SECTION:NOTES:END -->
