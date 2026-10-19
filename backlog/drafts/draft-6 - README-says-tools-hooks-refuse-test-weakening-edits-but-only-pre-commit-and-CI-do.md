---
id: DRAFT-6
title: >-
  README says tools/hooks refuse test-weakening edits, but only pre-commit and
  CI do
status: Draft
assignee: []
created_date: '2026-10-19 15:03'
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
<!-- AC:END -->
