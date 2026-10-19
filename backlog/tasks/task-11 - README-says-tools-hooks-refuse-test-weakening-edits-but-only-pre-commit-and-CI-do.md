---
id: TASK-11
title: >-
  README says tools/hooks refuse test-weakening edits, but only pre-commit and
  CI do
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 15:03'
updated_date: '2026-10-19 15:40'
labels:
  - size-1
  - docs
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-10.1 (README at e4c048f, line 26): 'The hooks in tools/hooks refuse edits that skip, focus or delete tests.' The guard that would do that at edit time, tools/hooks/pre-edit.ts, was unregistered from .claude/settings.json on 2026-10-18 (CLAUDE.md). The registered hooks are launch-guard (Agent), post-edit (--mode files) and stop (--mode all), and none of them runs the weakening review. That review (tools/checks/weakening.ts via run.ts reviewGitChange) runs only in --mode staged (lefthook pre-commit) and --mode ci. So a public reader is told about an edit-time guard that is currently off. Also line 24 says TASK-1.37 'turned' the canvas into screens, but TASK-1.37 is still In Progress.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README says where test-weakening is actually refused (at pre-commit and in CI, by the weakening review), or the edit-time guard is re-registered first
- [ ] #2 README's TASK-1.37 line matches its status
- [ ] #3 README says the Storybook site exists only once the repo is public (TASK-10.5's criterion 2)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Edit README.md only: the hooks sentence says checks run after agent edits, at pre-commit and in CI, and that pre-commit and CI refuse weakening changes; the TASK-1.37 line says the screens are built and it stays open for the phone checks; the browser line says the Pages site exists once the repo is public.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by the orchestrator (size 1, the doer accepts). Not re-registering the edit-time guard: Bruk unregistered it on Oct 18, 2026, so the README now says what is true. Criterion 3 added at acceptance because the TASK-10.5 review refused on the same README.

Built by the orchestrator, Oct 19, 2026: all three sentences edited as planned.
<!-- SECTION:NOTES:END -->
