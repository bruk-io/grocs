---
id: DRAFT-2
title: 'New agent worktrees start without dependencies, so layer builders stall'
status: Draft
assignee: []
created_date: '2026-10-19 12:40'
labels:
  - agents
dependencies: []
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
