---
id: TASK-25
title: pnpm check fails on a merge conflict marker
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-20 18:20'
updated_date: '2026-10-20 21:59'
labels:
  - size-1
  - testing
dependencies: []
modified_files:
  - tools/checks/merge-conflict-markers.ts
  - tools/checks/registry.ts
  - tools/checks/merge-conflict-markers.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On Oct 20, 2026 the orchestrator's merge of TASK-18/19 hit a conflict in a task file, a later commit in the same script concluded the merge with the markers still in it, and the pre-commit hook passed, because no check looks for '<<<<<<< ' / '>>>>>>> ' lines. It reached origin (efcfccc) and was fixed in aa783b6. Only a board file was affected, but the same slip in a source file would have reached CI before anything noticed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 pnpm check fails on any tracked file holding a line that starts with a merge conflict marker, naming the file, line and why
- [ ] #2 A test shows the check catching a marker and passing a clean file, and it runs in pre-commit and CI like every other check
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. New file tools/checks/merge-conflict-markers.ts: a check that lists every git-tracked file (git ls-files from ctx.root, not ctx.allFiles - allFiles' SKIP_DIRS excludes backlog/ and .claude/, exactly where the real Oct 20 incident landed), skips the same binary/lock extensions lib.ts's makeContext already excludes from allFiles, reads each remaining file as utf8 (skip on a read error - a path git has indexed but the working tree lacks), and flags any line starting with a conflict marker: <<<<<<< (7 <, not 8+), ||||||| (diff3), ======= (exactly 7 =, alone on the line), or >>>>>>> (7 >, not 8+). One rule, 'merge-conflict-markers/marker-left-in-file', naming the file and line.
2. Register it in tools/checks/registry.ts's checks array.
3. New file tools/checks/merge-conflict-markers.test.ts: a passing case (no finding on ordinary files, including something that merely contains '=' repeated but not exactly 7 alone, to prove it is not a loose substring match) and a failing case (a fixture file with a real conflict marker block triggers the finding with the right file and line).
4. Run pnpm check and pnpm test; confirm the check count in pnpm check's own output goes from 13 to 14.

### Risks
False positives: a line of exactly 7 '=' with nothing else is rare in real prose but could appear in some generated or example file as a divider; if pnpm check --mode all surfaces a real false positive anywhere in the repo, treat that file's content as the finding (the check may be legitimately strict), not as a reason to narrow the regex without evidence.

### Proof
pnpm check reports 14 checks and stays clean on the current repo; the new test file shows both a pass and a catch; a quick manual check (insert a real <<<<<<< marker into a scratch file, run pnpm check --mode all, see it caught, then remove it) confirms end to end.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

```text
[ERR_PNPM_UNSUPPORTED_ENGINE] Unsupported environment (bad pnpm and/or Node.js version)

Your Node version is incompatible with "/Users/brukhabtu/src/github.com/bruk-io/grocs".

Expected version: >=24.12
Got: v22.21.1

This is happening because the package's manifest has an engines.node field specified.
To fix this issue, install the required Node version.
```
<!-- SECTION:NOTES:END -->
