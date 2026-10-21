---
id: TASK-38
title: 'check:demo runs only in the demo APK workflow, not on pull requests'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 19:03'
updated_date: '2026-10-21 15:15'
labels:
  - size-1
  - ci
dependencies: []
modified_files:
  - .github/workflows/ci.yml
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-10.4 added pnpm check:demo (tools/demo-bundle.ts) and runs it only in .github/workflows/demo-apk.yml, which triggers on apk/**, demo-v* tags and by hand. ci.yml does not run it, so a change on main that pulls Firebase into the demo bundle is only caught when Bruk cuts a demo tag, after merge, and the tag then gets no Release.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ci.yml runs pnpm check:demo on pull requests and pushes to main, or the reason it can't is written in ci.yml
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In .github/workflows/ci.yml's bundles job, add a step running pnpm check:demo right after the existing pnpm check:release step - same job, since both build Expo bundles and check:release already runs there with no special env setup (demo-bundle.ts sets APP_VARIANT=demo/EXPO_PUBLIC_APP_VARIANT=demo itself, the same way release-bundle.ts needs nothing special from the caller).

### Risks
Low: check:demo exports a second set of bundles (demo variant) in the same job as check:release's real-variant bundles, adding to the job's running time - acceptable, since TASK-10.4's own demo-apk.yml already does this same export as part of a slower, separate workflow, and catching a Firebase leak into the demo bundle before merge (not after a tag is cut) is the point of this task.

### Proof
ci.yml's YAML stays valid; pnpm check:demo passes locally against the current repo (no Firebase code reaches the demo bundle today, confirmed earlier this session).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
ci.yml's bundles job now runs pnpm check:demo right after pnpm check:release, same job, no extra env setup needed (demo-bundle.ts sets APP_VARIANT=demo itself). Verified locally: pnpm check:demo passes (demo bundles hold no Firebase code, 2 bundles, 5 barred path patterns), pnpm check (14 checks) and typecheck are clean, pnpm test passes (110 files, 1458 tests - one transient, non-reproducing flake in an unrelated test cleared on immediate retry, consistent with background contention from other concurrent work this session, not this change).
<!-- SECTION:NOTES:END -->
