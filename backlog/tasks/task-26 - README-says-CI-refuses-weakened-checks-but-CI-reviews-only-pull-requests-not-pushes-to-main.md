---
id: TASK-26
title: >-
  README says CI refuses weakened checks, but CI reviews only pull requests, not
  pushes to main
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 15:56'
updated_date: '2026-10-20 21:58'
labels:
  - size-1
  - docs
dependencies: []
modified_files:
  - .github/workflows/ci.yml
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In .github/workflows/ci.yml's checks job, the existing 'Weakened checks (R57)' step only runs 'if: github.event_name == pull_request'. Add a second step for the push case: 'if: github.event_name == push', running 'node tools/checks/run.ts --mode ci --base ${{ github.event.before }}', guarded against the all-zeros SHA GitHub sends on a branch's first push ('if: github.event_name == push && github.event.before != '0000000000000000000000000000000000000000''). fetch-depth: 0 on this job's checkout already makes the prior commit resolvable.
2. Keep README.md's existing wording - 'the pre-commit hook and CI also review the change itself' becomes true instead of needing to be qualified, since CI now reviews both pull requests and direct pushes to main (how this repo's own orchestrator lands work, per CLAUDE.md).

### Risks
Low: github.event.before can be the all-zeros SHA on an unusual event (a new branch's first push); guarded explicitly rather than letting --mode ci fail confusingly on an unresolvable ref.

### Proof
ci.yml's YAML is valid (check with a local YAML parse or gh workflow view after push); node tools/checks/run.ts --mode ci --base <some earlier real commit SHA> against this repo's own history catches a real weakening when run by hand, the same mechanism hooks.test.ts already exercises generically for --mode ci. No repro test is filed on the task itself: this is a workflow-wiring gap, not a failing unit test, the same as TASK-11's precedent.
<!-- SECTION:PLAN:END -->
