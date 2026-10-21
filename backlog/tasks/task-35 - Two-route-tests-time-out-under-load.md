---
id: TASK-35
title: Two route tests time out under load
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-21 01:32'
updated_date: '2026-10-21 03:34'
labels:
  - testing
  - size-2
dependencies: []
modified_files:
  - apps/mobile/src/routes/error-boundary.route.test.tsx
  - apps/mobile/testing/route-setup.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Seen 2026-10-20 while three builders and reviewers ran full test suites at once:
- apps/mobile/src/routes/kitchen.route.test.tsx 'creating a kitchen > shows the invite link and code, then Groceries works on that kitchen' timed out waiting for 'Nothing on the list yet' once in six runs in one worktree (TASK-33's review), and passed in later full checks.
- apps/mobile/src/routes/error-boundary.route.test.tsx timed out at 5 s in several full runs and alone with the change stashed (TASK-30's build); its dynamic import of apps/mobile/app/_layout.tsx takes about 5 s on a cold cache.
A test that fails without a code change makes every red run suspect and costs a rerun.

## Affected users and systems
apps/mobile route tests; the pre-commit hook and CI, which run them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Both tests pass in 20 consecutive full runs on a loaded machine (for example three suites in parallel), with the evidence in the notes
- [x] #2 Neither test's timeout is raised without a recorded reason for the time it needs
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. apps/mobile/src/routes/error-boundary.route.test.tsx: its one test dynamically imports app/_layout.tsx, pulling in the whole app's module graph for the first time in that worker - on a cold cache this alone takes close to vitest's default 5 s test timeout. Give this one test an explicit timeout (15_000 as the third argument to it()) with a comment explaining why, rather than raising the whole project's default.
2. apps/mobile/src/routes/kitchen.route.test.tsx's flaky test (and every other route test) calls screen.findByText/findBy* repeatedly; testing-library's default 1000 ms internal wait (asyncUtilTimeout) is tight when several full suites run at once and React renders plus FakeKitchenGateway's promise round trips get starved. Raise it globally for route tests via configure({ asyncUtilTimeout: 5000 }) in apps/mobile/testing/route-setup.ts (the project's one setup file), with a comment explaining why, rather than patching one call site - any route test's findBy* could flake the same way under the same load.
3. Verify under genuine load, not just alone: run three full vitest run --project app suites in the background to create real contention, then run the two named tests 20 consecutive times while that load is active; record the exit codes in the task notes.

### Risks
A global asyncUtilTimeout bump could in principle hide a test that waits for something that will never actually appear, turning a fast failure into a slow one - acceptable here since every route test already asserts a specific, real UI outcome, and the two known flakes are from genuine load contention (confirmed by one passing on retry with no code change), not a broken assertion.

### Proof
20/20 consecutive runs pass with three full app-project suites running concurrently in the background; pnpm check/typecheck/test all green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-20: recurred under load while committing TASK-30's review notes on its branch (a pre-commit unit-test run failed with no code change; the retry passed 1421/1421). Also recurred during TASK-33's redo commit.

Implemented directly by the orchestrator at Bruk's explicit request (apps/mobile route tests, normally the UI session's territory, but this one was asked for directly in chat). error-boundary.route.test.tsx: its one test now carries an explicit 15_000 ms timeout with an inline comment (cold-cache dynamic import of app/_layout.tsx, confirmed close to the default 5 s budget). apps/mobile/testing/route-setup.ts: added configure({ asyncUtilTimeout: 5000 }) from @testing-library/react (the project's one setup file, so this covers every route test's findBy*/waitFor, not just the one that was caught), with a comment explaining why. Verified under genuine load: launched three full 'vitest run --project app' suites in the background (8 files/70 tests each, all passed), then ran the two named tests 20 consecutive times while that load was active - 20/20 exit 0. pnpm check (14 checks), typecheck, and the full test suite (108 files, 1424 tests) all pass.
<!-- SECTION:NOTES:END -->
