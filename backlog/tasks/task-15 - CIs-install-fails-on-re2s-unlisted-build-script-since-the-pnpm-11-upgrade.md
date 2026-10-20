---
id: TASK-15
title: CI's install fails on re2's unlisted build script since the pnpm 11 upgrade
status: Done
assignee:
  - '@claude'
created_date: '2026-10-20 05:51'
updated_date: '2026-10-20 11:12'
labels:
  - size-1
  - ci
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Since TASK-7 moved the repo to pnpm 11.28.6, every CI run on main has failed at pnpm install --frozen-lockfile with ERR_PNPM_IGNORED_BUILDS for re2@1.27.0 (first red run 9630246, Oct 20 03:29 UTC), so no check, test or browser pass has run on CI since. pnpm 11 fails an install over any dependency build script not named in allowBuilds. re2 is an optional native dependency of superstatic, under firebase-tools; superstatic falls back to RegExp without it. Found when the visual baselines workflow failed the same way on TASK-12's branch (run 39376950376).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 pnpm-workspace.yaml declines re2's build explicitly, with the reason, and a frozen install succeeds with the lockfile unchanged
- [x] #2 CI on main is green again on all three jobs
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add "re2": false to allowBuilds in pnpm-workspace.yaml with a comment giving the reason; prove with CI=true pnpm install --frozen-lockfile locally (clean, lockfile unchanged) and CI on main.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 20, 2026). Local CI=true pnpm install --frozen-lockfile: 'Lockfile is up to date', exit 0, no ERR_PNPM_IGNORED_BUILDS; only pnpm-workspace.yaml changed.

No repro: the failure is CI's install under pnpm 11 on a clean runner (ERR_PNPM_IGNORED_BUILDS re2@1.27.0, run 39376950376 on the baselines workflow, and main's ci runs before 026fa26). It is reproduced by CI itself, not a test; the fix's proof is ci run 39377489029 green on all three jobs.

Review (philosophy:reviewer, Oct 20 2026), commit 026fa26. Verdict: closed. #1: 026fa26 changes only pnpm-workspace.yaml (allowBuilds re2: false, with the reason); the lockfile is untouched and CI's frozen install on 026fa26 passed. #2: ci run 39377489029 on 026fa26 is success on all three jobs. Before: run 39376950376 failed at install with ERR_PNPM_IGNORED_BUILDS re2@1.27.0. Optional reasoning holds: the lockfile lists re2 under superstatic's optionalDependencies, optional: true, and the emulator job is green without it. Findings: none. Notes and close land in main's checkout, uncommitted, for the orchestrator to commit.
<!-- SECTION:NOTES:END -->
