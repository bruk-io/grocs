---
id: TASK-42
title: 'New agent worktrees start without dependencies, so layer builders stall'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 12:40'
updated_date: '2026-10-22 04:44'
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
