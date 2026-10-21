---
id: DRAFT-14
title: Two route tests time out under load
status: Draft
assignee: []
created_date: '2026-10-21 01:32'
updated_date: '2026-10-21 02:01'
labels:
  - testing
dependencies: []
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
- [ ] #1 Both tests pass in 20 consecutive full runs on a loaded machine (for example three suites in parallel), with the evidence in the notes
- [ ] #2 Neither test's timeout is raised without a recorded reason for the time it needs
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-20: recurred under load while committing TASK-30's review notes on its branch (a pre-commit unit-test run failed with no code change; the retry passed 1421/1421). Also recurred during TASK-33's redo commit.
<!-- SECTION:NOTES:END -->
