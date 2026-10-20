---
id: TASK-7
title: Upgrade pnpm 10 to pnpm 11
status: To Do
assignee: []
created_date: '2026-10-19 03:59'
updated_date: '2026-10-20 03:10'
labels:
  - size-1
dependencies:
  - TASK-3
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-6 (D3, TASK-1.8) pins the workspace to pnpm 10.34.7 and names the move to pnpm 11 as a separate size-1 task, not done as part of that decision or of TASK-3. pnpm 11 defaults to strictDepBuilds, which means every package with an install/postinstall build script (at least firebase-tools, lefthook, esbuild via Vite) must be listed under pnpm-workspace.yaml's allowBuilds before the upgrade, or installs will silently skip running those scripts. It also turns on blockExoticSubdeps by default. minimumReleaseAge: 1440 is already set (TASK-3) to match pnpm 11's default ahead of time.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packageManager and the pnpm-workspace.yaml nodeLinker/engineStrict settings are updated for pnpm 11 (pinned to the latest 11.x at the time of the upgrade)
- [ ] #2 Every package with a build script that pnpm 11's strictDepBuilds would otherwise block is listed under allowBuilds in pnpm-workspace.yaml, found by running the install and reacting to what it blocks rather than guessing the list
- [ ] #3 pnpm install --frozen-lockfile, pnpm check, pnpm typecheck, pnpm test and pnpm check:release all pass on pnpm 11
<!-- AC:END -->
