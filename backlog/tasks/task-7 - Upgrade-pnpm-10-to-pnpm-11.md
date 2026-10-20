---
id: TASK-7
title: Upgrade pnpm 10 to pnpm 11
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 03:59'
updated_date: '2026-10-20 03:21'
labels:
  - size-1
dependencies:
  - TASK-3
modified_files:
  - package.json
  - pnpm-workspace.yaml
  - pnpm-lock.yaml
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Bump packageManager in package.json to pnpm@11.28.6 (latest 11.x as of 2026-10-20). Update pnpm-workspace.yaml's engineStrict-related settings for pnpm 11 if any changed shape (check pnpm 11's migration notes/changelog first).
2. Run pnpm install --frozen-lockfile under Node 24 and read what strictDepBuilds blocks (it lists the blocked packages explicitly in its warning output).
3. Add each blocked package to pnpm-workspace.yaml's allowBuilds list, re-run install, repeat until the warning is gone and node_modules/react-native is a real directory (not a symlink, same proof TASK-3 used).
4. Run pnpm check, pnpm typecheck, pnpm test, pnpm check:release under pnpm 11; fix anything that genuinely broke (don't weaken a check to get past it - if something looks like a real pnpm-11 regression, stop and report rather than hack around it).
5. Update .github/workflows/ci.yml if it pins a pnpm version anywhere (check first - it may already just read packageManager via corepack).

### Risks
- blockExoticSubdeps (also new in pnpm 11) could also change resolution for something in this workspace - watch for any dependency go missing from node_modules that check/typecheck/test would catch.
- This is a major-version bump to the package manager every other active session on this machine also uses against the same repo - build and verify this entirely inside your isolated worktree; the orchestrator will not merge it to main until pnpm check/typecheck/test/check:release are all independently re-verified green there.
- Do not touch packages/ui or apps/mobile's screens.

### Proof
- pnpm install --frozen-lockfile, pnpm check, pnpm typecheck, pnpm test, pnpm check:release all pass under pnpm 11 in the worktree.
- allowBuilds list was derived from the install's own blocked-package warnings, not guessed.
<!-- SECTION:PLAN:END -->
