---
id: DRAFT-16
title: Declare the repository's checks in .claude/checks.json
status: Draft
assignee: []
created_date: '2026-10-18 18:39'
labels:
  - size-1
  - architecture
milestone: m-1
dependencies: []
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.3 and TASK-1.4. record-check --tier full fails with 'no checks declared' because .claude/checks.json is missing, so a reviewer's check output can't be recorded on the task. The full tier the reviewer ran by hand: pnpm check, typecheck, test, test:emulator, check:release, and the ui build-storybook.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 record-check --tier fast and --tier full run and record the repository's checks
- [ ] #2 The full tier runs the same commands as CI
<!-- AC:END -->
