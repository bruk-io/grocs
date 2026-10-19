
<!-- BACKLOG.MD GUIDELINES START -->
<!-- backlog.md-instructions-version: 1.54.0 -->
<CRITICAL_INSTRUCTION>

## Backlog.md Workflow

This project uses Backlog.md for task and project management.

**At the beginning of each conversation in this project, run `backlog instructions overview` before answering or taking action. Re-read it only if you have not read it yet in the current conversation.**

Use the overview to decide whether to search, read, create, or update Backlog tasks.

Before task lifecycle actions, read the matching detailed guide:
- `backlog instructions task-creation` before creating or splitting tasks
- `backlog instructions task-execution` before planning, changing status or assignee, adding a plan or implementation notes, or implementing task work
- `backlog instructions task-finalization` before checking acceptance criteria, writing final summaries, or moving tasks to terminal statuses

Use `backlog <command> --help` before running unfamiliar commands. Help shows options, fields, and examples.

Do not edit Backlog task, draft, document, decision, or milestone markdown files directly. Use the `backlog` CLI so metadata, relationships, and history stay consistent.

</CRITICAL_INSTRUCTION>
<!-- BACKLOG.MD GUIDELINES END -->

## Workspace

One pnpm TypeScript workspace; the layout and the reasons are in spec doc-1 (`backlog doc view doc-1`).

- `pnpm check`: every check script over the repo. The same script runs from agent hooks (`.claude/settings.json`), `lefthook.yml` (pre-commit; install with `pnpm hooks:install`) and `.github/workflows/ci.yml`. Each failure names the rule and why it exists.
- `pnpm test`: unit tests. `pnpm test:emulator`: provider contract suites and the two-client test against the Firebase emulators (needs Java, no Docker). `pnpm emulators`: start the emulators with seed data. `pnpm typecheck`.
- Visual baselines (`packages/ui/visual-baselines/`) are compared on Linux only and generated in one place: the `visual baselines` workflow (`.github/workflows/visual-baselines.yml`), run on a pushed branch. It uploads them for review and never commits; the commands are at the top of that file. A Linux sandbox on the same Chromium matches it, but the workflow is the reference.
- Checks live in `tools/checks`, hook entry points in `tools/hooks`. Fix the code, not the check; hooks block edits that skip, focus or delete tests or loosen a check.

## Working with agents

How slices are delivered by an orchestrator and per-layer agents, with pinned models and efforts, is decision-3 (`backlog decision list`). The 18 layer agents (6 layers x `builder`, `builder-small`, `reviewer`) are generated under `.claude/agents/` from `tools/agents/template.md` and `tools/agents/configs/<layer>.json`; run `pnpm agents:generate` after changing either, never edit a generated `.md` file by hand (`pnpm check`'s `agent-definitions` check fails on drift or on a model/effort that disagrees with decision-3 and the plugin's route table). The agent-launch guard (`tools/hooks/launch-guard.ts`, on the `Agent` tool) still enforces decision-3's Enforcement section for every launch. The write guard (`tools/hooks/pre-edit.ts`, on `Edit|Write|Bash`) is built and tested (TASK-1.18) but Bruk removed its `.claude/settings.json` registration on 2026-10-18 because its one `ask` path (loosening check/CI config) had a false-positive bug that was prompting too often during parallel agent runs; its `deny` paths (layer-boundary writes, test deletion) never prompted a human at all. Nothing currently stops an agent from writing outside its own layer. Re-register it in `.claude/settings.json` to bring that back, ideally after fixing the `ask`-path bug in `reviewBash` (ordinary `>`-redirect false-positives like `2>&1`).

A layer task (a slice split into per-layer work) carries a `layer-<name>` label (`layer-core`, `layer-ports`, `layer-application`, `layer-providers`, `layer-ui`, `layer-app`) alongside its `size-*` label; the launch guard reads it to confirm a launch's layer, model and (for size-1) numbered steps before the agent starts. No task uses this label yet, since no slice has been split into layer tasks; the orchestrator sets it when it does.

- The board is the source. The orchestrator keeps statuses current on `main` and pushes whenever work changes hands.
- A worker gets a task ID, the model and effort `board-check route <id>` gives, and its own worktree. It writes its plan (`philosophy:plan-change`) before editing, and reports in the task's notes.
- Agent worktrees live in `.claude/worktrees/` (gitignored). The orchestrator never `cd`s into one; a worker's uncommitted edits are not the orchestrator's to commit.
- A long-running `isolation:'worktree'` agent (the Workflow tool) can hold a stale, pre-fix snapshot of `main` for as long as it runs: a worktree branched before a fix merges doesn't get that fix just because `main` moved. Before such an agent commits, it (or the orchestrator, if the agent can't resolve its own merge) refreshes the worktree against current `main` first. This is TASK-1.36's corruption bug recurring under a different trigger (TASK-4), not a new class of bug.
- Run commands from the repo root. Chaining `cd … &&` in front triggers permission prompts.
- On the web, open only URLs a search returned; fetching a recalled or hand-built URL asks the person for approval.
- `philosophy:reviewer` closes tasks. It can't commit a follow-up draft it files, so the orchestrator reads it and files it on `main`.

The design canvas is retired: Storybook is the design system. The old boards are a read-only reference in `design/reference/`, deleted as each is built (spec R66).
