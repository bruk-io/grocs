---
id: DRAFT-12
title: pnpm check fails on a merge conflict marker
status: Draft
assignee: []
created_date: '2026-10-20 18:20'
labels:
  - size-1
  - testing
dependencies: []
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
