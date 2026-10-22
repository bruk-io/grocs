---
id: TASK-7
title: Upgrade pnpm 10 to pnpm 11
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 03:59'
updated_date: '2026-10-22 23:20'
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
- [x] #1 packageManager and the pnpm-workspace.yaml nodeLinker/engineStrict settings are updated for pnpm 11 (pinned to the latest 11.x at the time of the upgrade)
- [x] #2 Every package with a build script that pnpm 11's strictDepBuilds would otherwise block is listed under allowBuilds in pnpm-workspace.yaml, found by running the install and reacting to what it blocks rather than guessing the list
- [x] #3 pnpm install --frozen-lockfile, pnpm check, pnpm typecheck, pnpm test and pnpm check:release all pass on pnpm 11
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Upgraded workspace from pnpm 10.34.7 to pnpm 11.28.6 in isolated worktree.

### Changes Made
1. **package.json**: Bumped packageManager from pnpm@10.34.7 to pnpm@11.28.6
2. **pnpm-workspace.yaml**: Added allowBuilds configuration for packages blocked by pnpm 11's strictDepBuilds default:
   - @firebase/util (postinstall script)
   - esbuild (postinstall script)
   - lefthook (postinstall script)
   - protobufjs (postinstall script)

### Why These Packages Needed allowBuilds
pnpm 11 defaults to strictDepBuilds=true, which prevents build scripts from running unless explicitly allowed. These packages have postinstall scripts required for proper functionality:
- @firebase/util: postinstall.js (utility setup)
- esbuild: install.js (native binary compilation)
- lefthook: postinstall.js (git hook synchronization)
- protobufjs: scripts/postinstall (code generation)

### Verification
All checks and tests pass under pnpm 11:
- pnpm check: ✓ (13 checks)
- pnpm typecheck: ✓ (no type errors)
- pnpm test: ✓ (1277 tests passed across 96 test files)
- pnpm check:release: ✓ (release bundle builds successfully)
- Pre-commit hook: ✓ (checks + typecheck + unit-tests all passed)
- react-native: confirmed as real directory (not symlink), proving proper hoisted installation

### Commit
Branch: task-7-pnpm11-upgrade
Commit SHA: c84346a
Worktree: /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/task-7-pnpm11

No compatibility issues detected. pnpm-lock.yaml remained unchanged (frozen install), confirming lock file compatibility with pnpm 11.

Orchestrator: independently re-verified in the worktree (not just the builder's word) - pnpm install --frozen-lockfile, pnpm check, pnpm typecheck, pnpm test, pnpm check:release, pnpm check:demo and pnpm test:emulator (57/57) all green under pnpm 11.28.6. Merged to main (commit c84346a, fast-forward). One real consequence worth recording: pnpm install under pnpm 11 purged and rebuilt node_modules (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY without CI=true), which crashed this session's long-running 'npx expo run:android' background process (ENOENT on a node_modules file it had already resolved). Restarted it; no data loss, just a reminder that a pnpm major-version bump invalidates any process holding node_modules open, on this or any other session sharing the checkout.

Checks changed: .claude/checks.json gained the browser pass (decision-11 level 3, commit 5a3cecc) after this task was accepted - unrelated, already-merged work adding a new check, not a change to the checks this task's own pnpm-11 upgrade was reviewed against.

pnpm 10 to 11 upgrade, merged and independently re-verified by the orchestrator in a worktree (pnpm install --frozen-lockfile, check, typecheck, test, check:release, check:demo, test:emulator all green under pnpm 11.28.6). Lock file unchanged under a frozen install, confirming compatibility. Never formally closed after the merge; closing now with no further changes needed.
<!-- SECTION:NOTES:END -->
