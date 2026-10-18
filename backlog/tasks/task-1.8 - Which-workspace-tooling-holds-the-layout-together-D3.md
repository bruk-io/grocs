---
id: TASK-1.8
title: Which workspace tooling holds the layout together? (D3)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 22:17'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies:
  - TASK-1.4
references:
  - >-
    backlog/decisions/decision-6 -
    Workspace-tooling-pnpm-10-hoisted-no-task-runner-our-own-import-checker.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D3 in doc-1: package manager, task runner and import checker (R26, R27), including the check that design levels import only downward (R60). Proposed from the walking skeleton's provisional choices.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-6 on 2026-10-18 from the skeleton's choices and probes. Waiting on Bruk to accept.

## Review 2026-10-18 (philosophy:reviewer)

Verdict: the one criterion, 'Decision recorded', is met and is ticked. The status was NOT moved to Done: scripts/close-task refused, and the refusal is a defect in the repository, not in this task (see finding 1). Status left In Progress for the orchestrator to close once the repository is repaired.

Evidence for the criterion: backlog/decisions/decision-6 exists with status: accepted; its Context names design question D3 in doc-1 and TASK-1.8 by id; TASK-1.8's references field points at that file. It answers all three parts D3 asked (package manager, task runner, import checker) plus the R60 design-levels check, weighing the alternatives against dated repository evidence, probes and sources.

Reviewer-tier check: could not run. record-check --tier full exits because .claude/checks.json does not exist; that gap is already owned by TASK-1.33, so it is not a new finding. This task changed no code, so there was nothing for a check to verify.

Findings:
1. High, filed as DRAFT-3. The repository's .git/config gained core.bare=true during this session, so every work-tree git command now fails with 'must be run in a work tree'. close-task therefore reports this task's file as never committed, although git ls-files and git log show it tracked since ea4b480. No task in this repository can be closed until that is repaired. Same symptom as TASK-1.36, which was closed in 667f4ce, but no test suite ran here, so the writer is in the close path itself.
2. Medium, filed as DRAFT-2. decision-6 mandates concrete repository changes and nothing on the board owns any of them: moving nodeLinker/autoInstallPeers out of .npmrc into pnpm-workspace.yaml, the Node 24 move, the Metro watchFolders cleanup, erasableSyntaxOnly, and the two new import-layer rules that close the R60 gaps the decision's own probes found. The realistic failure is the .npmrc one: pnpm 11 stops reading non-auth settings from .npmrc, so a bump would silently drop nodeLinker: hoisted and the install would quietly become isolated. The decision's 'Still open' section also assumes a pnpm 11 upgrade task that does not exist.
3. Low, for the orchestrator, no task. decision-6's proposed -> accepted flip is an uncommitted working-tree edit; committed history still shows proposed. Commit it alongside this close so the task is not Done against a decision the repository records as unaccepted. The other modified decision files (4, 5, 8, 9, 10) are outside this review.
4. Informational. Parent TASK-1's open questions carry no D3 line, so nothing is left dangling there.

Repo repaired (.git/config's core.bare flip from a concurrent stale workflow agent fixed by the orchestrator). Reviewer's verdict stands: the one criterion is met (decision-6 accepted, referenced, answers D3 in full). Finding 1 (the core.bare defect) is the repair just made. Finding 2 (decision-6's consequences unowned by any task) and finding 3 (commit the proposed->accepted flip) are being filed/handled by the orchestrator now.
<!-- SECTION:NOTES:END -->
