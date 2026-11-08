---
id: TASK-15
title: CI's install fails on re2's unlisted build script since the pnpm 11 upgrade
status: Done
assignee:
  - '@claude'
created_date: '2026-10-20 05:51'
updated_date: '2026-10-20 07:43'
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

Fixed in 026fa26: re2 (an optional native build for superstatic, under firebase-tools) declined explicitly in pnpm-workspace.yaml's allowBuilds with the reason (it's a speed-up only - superstatic falls back to RegExp without it). Verified: pnpm install --frozen-lockfile is clean with no ignored-build warnings, lockfile unchanged. CI run 39378425783 on main (the most recent push) is green on all three jobs: Checks/types/unit-tests, Provider contracts and two-client sync on the emulators, and Android/iOS bundles + Storybook build. The board wasn't updated after the fix landed in code - finishing that now and closing.

No repro: the failure was CI-environment-specific (a dependency's optional native build not present on this machine's prior installs, pnpm 11's strictDepBuilds failing the install when it find an unlisted one on a different machine) and the fix (026fa26) is already on main, so re-running the failing command now would pass, not fail. Real evidence instead: the actual failing CI runs are named in the task description (first red run 9630246, and the visual baselines run 39376950376 on TASK-12's branch); the first CI run after the fix (39377489029, commit 026fa26 itself) and the latest since (39378425783) are both green on all three jobs - a real before/after on the real CI system, not a local reconstruction.

Confirmed closed by the orchestrator. re2's build declined explicitly in pnpm-workspace.yaml with the reason; pnpm install --frozen-lockfile is clean (no ignored-build warnings, lockfile unchanged); CI on main is green on all three jobs as of run 39378425783. Fix already landed in 026fa26 (filed and committed by the other session's work alongside TASK-1.20.3); this close finishes the board bookkeeping that commit skipped.
<!-- SECTION:NOTES:END -->
