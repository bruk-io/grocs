---
id: TASK-5
title: 'vitest projects ignore the root allowOnly, so it.only passes CI'
status: To Do
assignee: []
created_date: '2026-10-18 23:31'
updated_date: '2026-10-19 03:28'
labels:
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-9 (D8) reproduced this against the repo's vitest 4.1.12: vitest.config.ts sets allowOnly: false at the root, but its five inline projects (unit, ui, app, tools, emulator) do not inherit root options unless extends: true is set. A scratch config with one inline project and a file containing it.only plus a failing test ran green (exit 0, 1 passed, 1 skipped); with extends: true on the project it exited 1. Today only tools/hooks/pre-edit.ts and the weakening diff review stop a focused test; a .only that reaches the repo any other way (an editor, a merge, a rebase) silently skips the rest of its file in pre-commit and in CI. decision-9 decided the fix (extends: true on all five projects, plus two tests) but it is not built.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every project in vitest.config.ts sets extends: true and the root allowOnly is false
- [ ] #2 A test in tools/checks/repo-checks.test.ts imports vitest.config.ts and asserts every project has extends: true and the root allowOnly is false
- [ ] #3 A test runs vitest in a temporary directory on a copy of that config plus a file containing it.only and asserts exit 1
<!-- AC:END -->
