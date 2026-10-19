---
id: DRAFT-9
title: >-
  Weakening check asks when a commit edits a check config that is new on its own
  branch
status: Draft
assignee: []
created_date: '2026-10-19 19:03'
labels:
  - size-1
  - ci
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
During TASK-10.4 the pre-commit weakening check (weakening/loosen-check-config, tools/checks/weakening.ts reviewChange) flagged removing lines from .github/workflows/demo-apk.yml between two commits on apk/demo, though the file does not exist on main. The builder squashed and force-pushed to get past it. Iterating a new workflow (which needs pushes to test) hits this every time. CI's PR-mode review against the base would see a new file and pass, so the pre-commit view is the stricter, wrong one here.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Removing lines from a check config that does not exist on the merge base with main is not a weakening finding in the pre-commit check
- [ ] #2 Removing lines from a check config that exists on main still asks (test)
<!-- AC:END -->
