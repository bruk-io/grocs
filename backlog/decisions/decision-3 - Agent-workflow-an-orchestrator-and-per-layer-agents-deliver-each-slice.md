---
id: decision-3
title: 'Agent workflow: an orchestrator and per-layer agents deliver each slice'
date: '2026-10-18 17:39'
status: accepted
---
## Context

The import layers (R26, R27) give each package a clear boundary. Bruk proposed agents that can each operate in only one layer, with a workflow delivering a slice while they work, an orchestrator that keeps the agents' understanding aligned and mediates between them, a few agents per layer for building, reviewing and fixing, and his philosophy plugin governing the tasks. He also asked for each agent to have an explicit model and reasoning effort. Decided by Bruk on Oct 18, 2026.

## Decision

Roles:
- The orchestrator (the main session) splits slices into layer tasks, owns each slice's contract, routes work, mediates contract changes and runs `learn-from-work` after each slice. It writes only the board, root config, the lock file and `.claude/`, never layer code.
- `builder-<layer>` plans, builds, checks and fixes within its layer, including later bugs routed to it as `bug` tasks.
- `reviewer-<layer>` reviews code against its layer's rules and examples and reports what to change and why. It writes nothing.
- `philosophy:reviewer` decides whether each task closes, from its acceptance criteria and evidence.
- Layers: core, ports, application, providers, ui, app.

Models and efforts are pinned in each agent's definition, in line with the plugin's route table:

| Agent | Model | Effort |
|---|---|---|
| Orchestrator | opus | high |
| builder-<layer> | sonnet | medium |
| reviewer-<layer> | opus | high |
| philosophy:reviewer | as its own definition says | as its own definition says |

How a slice runs:
1. Contract: the core builder adds the domain types and rules, then the ports builder adds the port changes, fakes and contract suites. Once reviewed, the contract is frozen for the slice.
2. In parallel, each in its own worktree: application, providers and ui builders, each followed by its layer reviewer.
3. The app builder adds screens, wiring and the slice's end-to-end flow.
4. `philosophy:reviewer` closes each task; the slice closes when its end-to-end flow passes.

Mediation: a contract lives in the slice task's plan. An agent that needs a change outside its layer writes the request in its task notes and stops. The orchestrator decides, updates the contract and marks every affected task `finish-moved` with the reason.

Enforcement:
- A hook before every edit checks the file's path against the calling agent's layer and blocks it with the reason. Each layer agent's Bash is narrowed to its own test and type-check commands, so the guard can't be bypassed through the shell.
- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` is set in the repo's settings so only the orchestrator delegates.
- Agent definitions are generated from one template and one small config per layer (paths, commands, rules files, example files, model, effort). A check fails when a committed definition differs from the generated one, or when a pinned model and effort disagree with the plugin's route table.
- Start with two or three builders at once, adding more only while their results can still be reviewed properly.

## Consequences

- The walking skeleton (TASK-1.4) is built in one session first. Its files become the examples each layer config points to, and its findings shape the template.
- Whether hook input identifies the calling subagent is unverified. If it doesn't, each layer agent gets its own sparse worktree instead.
- Size-1 leaves run on the same builders rather than a cheaper model, since the plugin's route for them asks for numbered steps. Revisit after the first slices if cost matters.
- Very small slices may be cheaper for one builder working through the layers in order. Decide from the first real slices.
