---
id: TASK-26
title: >-
  README says CI refuses weakened checks, but CI reviews only pull requests, not
  pushes to main
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 15:56'
updated_date: '2026-10-20 22:03'
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
- [x] #1 README says CI reviews weakened checks on pull requests only, or ci.yml also runs --mode ci on push to main against the previous commit
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
No repro: this is a workflow-wiring gap in .github/workflows/ci.yml, not a defect in shipped code, so no unit test can fail on it (the same precedent as TASK-11). The mechanism the fix wires is verified by hand instead: `node tools/checks/run.ts --mode ci --base 62f27be` (the SHA github.event.before would carry for the push that landed TASK-22) passed 14 checks in ci mode, and `--base e8b775c^` likewise, confirming --mode ci resolves a real commit SHA as its base and runs the diff review. Reviewer's full check on the merged tree: pnpm check, pnpm typecheck and pnpm test all exit 0, 103 test files / 1370 tests.

Closed. The single criterion is met by its second branch: ci.yml now also runs --mode ci on a push to main against the previous commit.

.github/workflows/ci.yml's checks job carries a second step, 'Weakened checks (R57), reviewed against the previous commit on main', gated `if: github.event_name == 'push' && github.event.before != '0000000000000000000000000000000000000000'` and running `node tools/checks/run.ts --mode ci --base ${{ github.event.before }}`. The all-zeros guard the plan asked for is there, the job's checkout already has fetch-depth: 0 so the prior commit resolves, and the workflow triggers on push to main, so the step will actually fire on how this repo lands work. README's existing wording is left as-is and is now true, as the plan intended.

Evidence, by hand rather than by repro, as the plan and the TASK-11 precedent set out: run.ts documents and parses --mode ci with --base and errors without it; `node tools/checks/run.ts --mode ci --base 62f27be` (the SHA github.event.before would carry for the push that landed TASK-22) passes 14 checks in ci mode, as does `--base e8b775c^`, so the wired mechanism resolves a plain commit SHA and runs the diff review. YAML parses. Reviewer's full check on the merged tree: pnpm check, pnpm typecheck and pnpm test all exit 0, 103 test files / 1370 tests.

Findings, none blocking, none filed:
- Low, outside the criterion: github.event.before is unresolvable after a force-push to main, which would make this step fail with a confusing git error rather than a weakening finding. Not worth a task on its own; worth folding into the next ci.yml task.
- For the orchestrator, not this task: the working tree carries uncommitted board state unrelated to either task (draft-1 deleted, task-24 untracked, visual-baselines.yml modified, mise.toml untracked). The board is the source, so task-24 should be committed.
<!-- SECTION:NOTES:END -->
