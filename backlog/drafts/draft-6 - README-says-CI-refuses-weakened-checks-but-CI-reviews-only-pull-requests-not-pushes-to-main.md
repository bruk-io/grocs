---
id: DRAFT-6
title: >-
  README says CI refuses weakened checks, but CI reviews only pull requests, not
  pushes to main
status: Draft
assignee: []
created_date: '2026-10-19 15:56'
labels:
  - size-1
  - docs
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-11. README (c193873) says 'the pre-commit hook and CI also review the change itself, refusing one that skips, focuses or deletes a test or loosens a check'. In .github/workflows/ci.yml the 'Weakened checks (R57)' step has 'if: github.event_name == pull_request'; on push to main it runs only --mode all, which has no diff review. The orchestrator pushes to main directly (CLAUDE.md), so in this repo's own workflow CI never runs the weakening review; only a locally installed lefthook (pnpm hooks:install) does.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README says CI reviews weakened checks on pull requests only, or ci.yml also runs --mode ci on push to main against the previous commit
<!-- AC:END -->
