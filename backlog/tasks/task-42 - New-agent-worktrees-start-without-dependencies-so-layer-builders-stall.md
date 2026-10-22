---
id: TASK-42
title: 'New agent worktrees start without dependencies, so layer builders stall'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 12:40'
updated_date: '2026-10-22 04:59'
labels:
  - agents
  - size-1
dependencies: []
modified_files:
  - tools/hooks/post-checkout.ts
  - lefthook.yml
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found Oct 19, 2026: worktrees from the Agent tool's isolation:'worktree' have no node_modules. builder-ui-small (TASK-1.37.11) stopped because installing is outside its allowed commands; the TASK-1.40/1.41 reviewer's first recorded check exited 2 for the same reason; the TASK-1.37.10 builder installed for itself. The orchestrator installed by hand.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A worktree made for an agent has its dependencies installed before the agent's first command, without the agent running an install
- [ ] #2 A layer builder can run its layer's test and type-check commands in a fresh worktree on its first try
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. New file tools/hooks/post-checkout.ts: installed via lefthook's post-checkout hook, which fires on every checkout including git worktree add (empirically confirmed: a post-checkout hook's CWD is the new worktree's own root). Checks whether node_modules exists at its own repo root (resolved from import.meta.url, so it is always the checkout it is actually running in); if missing, runs pnpm install --frozen-lockfile; if present, no-ops immediately, so an ordinary branch switch in an already-installed tree stays fast.
2. lefthook.yml gains a post-checkout hook group running this script, with a comment explaining why.
3. Run pnpm hooks:install so the local .git/hooks/post-checkout picks up the new group.
4. Verify end to end: commit the change first (a new worktree checks out committed state, not the working tree), then git worktree add a scratch worktree and confirm node_modules exists there afterward with no install run by hand; remove the scratch worktree and branch after.

### Risks
pnpm must already be on PATH wherever git worktree add runs for this to help - true for every layer-builder worktree created by the Agent tool so far this session, which already runs pnpm/node commands directly. If an agent's own worktree creation context somehow lacks pnpm, this hook fails loud (its own stdio is inherited) rather than silently, which is strictly better than today's silent no-node_modules stall.

### Proof
A scratch worktree created after this change has node_modules without anyone running an install by hand; pnpm check/typecheck/test still pass from the main checkout.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Review by @claude (2026-10-22), per task-finalization: did NOT close, both ACs remain unmet on independent reproduction.

Board had no implementation notes, comments, or final summary recording the claimed verification - nothing to check the reported manual test against, as required before closing.

Reproduced directly on this machine:
1. `git worktree add -b scratch /tmp/wt main` printed "Can't find lefthook in PATH" and the new worktree had no node_modules - AC1 failed outright. Cause: the committed lefthook.yml/post-checkout.ts are fine, but the *locally generated, uncommitted* .git/hooks/post-checkout dispatcher that `lefthook install`/`pnpm hooks:install` writes had a stale hardcoded fallback path baked in from a previous run - `/private/tmp/test-worktree-depcheck3/node_modules/lefthook-darwin-arm64/bin/lefthook` - which no longer exists. That implies hooks:install was last run from inside a scratch worktree rather than the main checkout; since git worktrees share one .git/hooks directory, that run overwrote the shared hook with a path specific to that now-deleted worktree. Every other fallback in lefthook's dispatcher also probes `$dir/node_modules/...` where $dir is the *new* worktree's own toplevel - which by definition has no node_modules yet - so none of them can bootstrap a brand-new worktree either; the dispatcher can only work via a global `lefthook` on PATH (not installed on this machine) or a correctly-pathed stale fallback.
2. After re-running `mise exec -- pnpm hooks:install` from the main checkout root (regenerating the hook with the correct absolute path), a fresh worktree add did invoke post-checkout.ts, but `pnpm install --frozen-lockfile` then failed loud with ERR_PNPM_UNSUPPORTED_ENGINE: the ambient `node` on PATH during `git worktree add` was v22.21.1 (mise shims not active in this shell), while package.json requires >=24.12. node_modules was still missing afterward. This is the same ambient-PATH gap the Risk section anticipated only for a missing pnpm, not for a wrong-but-present node/pnpm version - and it reproduces in exactly the kind of non-interactive shell an Agent-tool worktree would run in.

Net: AC1 is not met (dependencies are not reliably installed before the agent's first command - two independent failure modes block it), and AC2 is therefore unverified (no fresh worktree in this review ever reached a state where test/typecheck could run). Leaving status In Progress and both ACs unchecked. Scratch worktrees/branches used for reproduction were removed afterward.

Review (philosophy:reviewer) found two real, reproducible failures the first pass missed: (1) a worktree-triggered pnpm install re-runs lefthook's own postinstall ('lefthook install'), which regenerates the SHARED .git/hooks/post-checkout dispatcher (every worktree shares one .git/hooks dir) with a hardcoded path into the triggering worktree's own node_modules - breaking the hook for every worktree, including main, once the triggering one is removed; (2) the ambient PATH in the non-interactive shell git invokes the hook from can carry a Node version older than mise.toml pins, so a bare 'pnpm install' fails its engines check even though mise has the right version available. Fixed both: post-checkout.ts now runs 'mise exec -- pnpm install --frozen-lockfile' (pins the Node version instead of trusting PATH) with CI=1 and LEFTHOOK=0 in its env (lefthook's postinstall.js skips re-running 'lefthook install' when CI is set and LEFTHOOK is not, per node_modules/lefthook/postinstall.js - this is a documented skip, not a hack).

Re-verified end to end against the committed fix (89d2b64): created a scratch worktree with ambient PATH node still at v22.21.1 (not mise's 24.x) - install succeeded via the hook's own mise exec call, node_modules existed afterward, and .git/hooks/post-checkout's hardcoded lefthook path still pointed at the main checkout both immediately after the worktree install and after removing the scratch worktree/branch. pnpm check (14), pnpm typecheck, pnpm test (117 files/1544 tests) all green on main at 89d2b64 before push.
<!-- SECTION:NOTES:END -->
