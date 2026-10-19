---
id: TASK-1.42
title: A hook test spawns three processes in one 5 s test and times out under load
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 12:05'
updated_date: '2026-10-19 12:11'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/hooks/hooks.test.ts
parent_task_id: TASK-1
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
tools/hooks/hooks.test.ts 'allows the orchestrator writing the board, root config or .claude/' runs the pre-edit hook three times (a node start-up each) inside one test with vitest's default 5 s timeout. With several agents running checks at once it timed out on Oct 19, 2026: twice in TASK-1.37.9's pre-commit hook (unit-test runs of 425 s and 537 s) and once in a record-check of main (6151 ms), each time passing when run alone. A pre-commit hook that fails at random pushes people and agents to skip it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each path in that test is its own case, so no single test spawns more than one hook process, with the same assertion for every path
- [ ] #2 pnpm test passes, and the tools project still runs every case it ran before
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Split the three-path loop into it.each so each case spawns one hook process. Same assertion per path; no timeout or config change.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). Measured at load average 12 (five agents running checks): one hook spawn takes 1.2 to 4.4 s, so the three-spawn test overran 5 s while each split case now runs in one spawn's time. hooks.test.ts passed 4 of 5 runs straight after the split; the one failure was not captured by name, and two tests still spawn twice ('narrows a layer agent's Bash...' 4358 ms, 'also lets a layer agent run the extra commands...' 3673 ms), so they can still time out under this load. For @bruk: the remaining option is a longer timeout for this file's process-spawning tests (the R55 speed limit stays asserted by the post-edit tests' own ms < 5000 checks). That edits test config to get a green run, so it is your call under the fix-the-code-not-the-check rule; not done here.
<!-- SECTION:NOTES:END -->
