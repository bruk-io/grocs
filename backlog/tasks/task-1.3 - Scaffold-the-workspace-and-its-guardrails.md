---
id: TASK-1.3
title: Scaffold the workspace and its guardrails
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 17:38'
updated_date: '2026-10-18 17:52'
labels:
  - size-3
  - architecture
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sets up the repository layout in doc-1 and the checks that guard it, before any feature code exists, so the checks are never retrofitted. Cites R26, R27, R37, R52, R55, R56, R57, R58. Tool choices made here (package manager, test runners, import checker, pre-commit, CI) are provisional and feed design questions D3 and D8; record each choice and why in the notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The workspace has the folders from the spec's repository layout that the walking skeleton needs, each layer a package; unused ones are absent rather than empty
- [ ] #2 An import-layer check enforces R26 and R27 (no cycles, providers never import each other, ui imports tokens only) and every failure names the rule and why it exists
- [ ] #3 A guard blocks weakening edits (focusing or skipping a test, deleting a test, loosening a check's config) with the reason (R57)
- [ ] #4 Direct console use outside the console provider fails a check (R37)
- [ ] #5 The same check scripts run from agent hooks (after an edit, before an edit, before stop), from pre-commit and from a CI workflow; after-edit hooks finish within 5 seconds (R55, R56)
- [ ] #6 One command starts the Firebase emulators (Firestore, Auth) with seed data, and nothing in the repo points at a production project (R52)
- [ ] #7 .claude/rules/ holds only the judgement-only rules from the conversation that apply so far, one rule per file, each with its reason (R58)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. pnpm workspace, one package per layer. 2. tools/checks scripts behind one runner (all, files, staged, ci). 3. tools/hooks (pre-edit, post-edit, stop). 4. lefthook and GitHub Actions call the same runner. 5. Firebase emulators with seed, one command. 6. Judgement-only rules. 7. Fixture tests for every check, asserting message content.
<!-- SECTION:PLAN:END -->
