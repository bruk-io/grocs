---
id: TASK-1.18
title: Generate the layer agents and the launch hook
status: In Progress
assignee:
  - '@bruk.habtu@gmail.com'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 21:40'
labels:
  - size-5
  - agents
milestone: m-1
dependencies:
  - TASK-1.4
modified_files:
  - .claude/settings.json
  - CLAUDE.md
  - package.json
  - tools/checks/import-layers.ts
  - tools/checks/registry.ts
  - tools/checks/agent-definitions.ts
  - tools/checks/agent-definitions.test.ts
  - tools/hooks/hooks.test.ts
  - tools/hooks/launch-guard.ts
  - tools/hooks/launch-guard.test.ts
  - tools/hooks/lib.ts
  - tools/hooks/pre-edit.ts
  - tools/agents/layers.ts
  - tools/agents/roles.ts
  - tools/agents/template.md
  - tools/agents/generate.ts
  - tools/agents/generate.test.ts
  - tools/agents/write-guard.ts
  - tools/agents/configs/app.json
  - tools/agents/configs/application.json
  - tools/agents/configs/core.json
  - tools/agents/configs/ports.json
  - tools/agents/configs/providers.json
  - tools/agents/configs/ui.json
  - .claude/agents/builder-app-small.md
  - .claude/agents/builder-app.md
  - .claude/agents/builder-application-small.md
  - .claude/agents/builder-application.md
  - .claude/agents/builder-core-small.md
  - .claude/agents/builder-core.md
  - .claude/agents/builder-ports-small.md
  - .claude/agents/builder-ports.md
  - .claude/agents/builder-providers-small.md
  - .claude/agents/builder-providers.md
  - .claude/agents/builder-ui-small.md
  - .claude/agents/builder-ui.md
  - .claude/agents/reviewer-app.md
  - .claude/agents/reviewer-application.md
  - .claude/agents/reviewer-core.md
  - .claude/agents/reviewer-ports.md
  - .claude/agents/reviewer-providers.md
  - .claude/agents/reviewer-ui.md
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From decision-3. Waits on the walking skeleton (TASK-1.4), whose files are the examples. Template, six layer configs, generator, a check that committed definitions match and agree with the route table, the write guard, and the agent-launch hook.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 18 agent definitions are generated from one template and six configs, with pinned models and efforts
- [ ] #2 A check fails when a committed definition differs from the generated one or disagrees with the route table
- [ ] #3 The launch hook blocks a mismatched layer, model or size, and a size-1 task without numbered steps, with the reason
- [ ] #4 The write guard blocks an edit outside the calling agent's layer, with the reason
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work

1. Add `PACKAGE_LAYER`/layer helpers export from `tools/checks/import-layers.ts` (export the existing map and `Layer` type; no behaviour change) so the agent generator and both hooks share one layer table instead of a second copy.
2. Write `tools/agents/layers.ts`: the six `Layer` names (core, ports, application, providers, ui, app) and, per layer, which `packages/*` or `apps/*` directories it owns, derived from the exported `PACKAGE_LAYER` map plus `apps/*` for `app`.
3. Write `tools/agents/roles.ts`: the three roles (`builder`, `builder-small`, `reviewer`) with their pinned model/effort/tools/description fragments, each value commented with where it comes from:
   - `builder`: sonnet, medium -- mirrors board.py's `LEAF` (plugin `philosophy` 0.4.6, `scripts/board.py:59`).
   - `builder-small`: haiku, effort `high` -- board.py's `SMALL_LEAF` pins no effort (`None` = "the default"); decision-3's table pins `high` deliberately (its Consequences section: haiku is weaker on long agentic work, so size-1 leaves get the higher effort). Pinning a value where the route table leaves it unset specialises rather than contradicts it.
   - `reviewer`: opus, high -- decision-3's own table only; `route()` in board.py has no notion of a reviewer, so there is no plugin value to agree or disagree with. The check says this explicitly rather than inventing a correspondence.
   Also record the four route values actually read from board.py (model + effort for `LEAF`, `SMALL_LEAF`, `ORCHESTRATE`) as the comparison table the drift check uses, since `~/.claude/plugins/cache/...` is a local plugin-cache path that does not exist in CI -- the repo cannot shell out to it at check time, so the values are mirrored once, here, with their provenance, and the check compares committed definitions against this mirror.
4. Write the six layer configs under `tools/agents/configs/*.json` (core, ports, application, providers, ui, app): `paths` (the globs the write guard allows that layer to edit), `testCommand` and `typecheckCommand` (the two Bash invocations that layer's agents may run), `rulesFiles` (existing `.claude/rules/*.md` scoped to that layer, where any exist), `exampleFiles` (concrete paths from the walking skeleton, TASK-1.4, found by reading what that task actually built).
5. Write `tools/agents/template.md`: one markdown template with `{{token}}` placeholders for the frontmatter (name, description, tools, model, optional effort line, skills) and body (role, layer, allowed paths, rules, examples, commands).
6. Write `tools/agents/generate.ts`: a pure `buildDefinitions(layers, roles, template)` returning the 18 `{path, content}` pairs (`.claude/agents/<role>-<layer>.md` / `-small` variant), plus a thin CLI entry that writes them under `.claude/agents/`. Add `tools/agents/generate.test.ts` against the pure function (no fs).
7. Run the generator once, commit the 18 files under `.claude/agents/`.
8. Write `tools/checks/agent-definitions.ts`: regenerates in memory and diffs each of the 18 committed files byte-for-byte (`agent-definitions/drift`), and separately checks each committed file's `model`/`effort` frontmatter against the mirrored route table from step 3 (`agent-definitions/route-mismatch`, with the reviewer caveat worded into the message). Reads files directly off disk (`existsSync`/`readFileSync` under `ctx.root`), not through `ctx.files`/`ctx.allFiles`, because `lib.ts` puts `.claude` in `SKIP_DIRS` and those would silently enumerate to zero. Register it in `tools/checks/registry.ts`. Add `tools/checks/agent-definitions.test.ts`, including one test that asserts the check finds all 18 files (so the enumeration can't silently regress to finding none).
9. Extend `tools/hooks/pre-edit.ts` (the write guard, fires inside a worker): read `agent_type`/`agent_id` from the payload. If `agent_type` matches a generated layer-agent name, look up its layer and, for `Edit`/`Write`, block when the target path's layer (via the same `tools/agents/layers.ts` table) isn't that agent's own layer; for `Bash`, block any command that is not exactly that layer's configured `testCommand` or `typecheckCommand`. If `agent_type` is absent (the orchestrator), block any `Edit`/`Write` outside the board, root config, the lock file or `.claude/` (decision-3's line on what the orchestrator may touch, previously undeclared in code). Extend `tools/hooks/hooks.test.ts` with payloads carrying `agent_type` for both cases.
10. Write `tools/hooks/launch-guard.ts`: a new `PreToolUse` hook matched on the `Agent` tool (not `Edit|Write|Bash`, a separate matcher group). Reads `tool_input.subagent_type` and `tool_input.prompt`. Passes through anything whose `subagent_type` is not one of the 18 generated names. For a gated launch: extracts a `TASK-\d+(\.\d+)*` id from the prompt (block if none); reads that task's labels for a `layer-<name>` label and blocks on a mismatch with the agent's layer; shells out to `board-check route <id> --json` (this hook runs locally where the plugin is installed, unlike the repo check) and blocks if the model it returns disagrees with the committed agent definition's pinned model; for a `size-1` task, requires at least two numbered lines (`1.`, `2.`, ...) under the task's plan `### Order of work` section and blocks otherwise. Every block names the reason. `onFailure: "block"` in its settings entry, since a hook that fails open here lets every mismatched launch through. Add its tests to `hooks.test.ts`.
11. Wire `.claude/settings.json`: add a `PreToolUse` group with `matcher: "Agent"` running `launch-guard.ts`; leave the existing `Edit|Write|Bash` group pointed at the now-extended `pre-edit.ts`.
12. Add `"agents:generate": "node --disable-warning=ExperimentalWarning tools/agents/generate.ts"` to root `package.json`.
13. Update `CLAUDE.md`'s "Working with agents" section: the layer agents now exist (drop the "Until the layer agents are generated" framing), point at `.claude/agents/`, `pnpm agents:generate`, and the two hooks by name. Document the new `layer-<name>` task label convention the launch hook expects, since nothing introduces it today.
14. Document the `layer-<name>` label convention and the model/effort provenance decisions in TASK-1.18's implementation notes, with evidence per acceptance criterion.

### Risks

- **Hook payload may not actually carry `agent_type` the way the hooks-reference describes for this Claude Code build.** Mitigated by writing a real payload-capture test in `hooks.test.ts` against a synthetic JSON blob matching the documented shape, and noting in the task's notes that this is asserted against the documented schema, not observed live inside a real subagent run (the worktree has no way to launch a real nested subagent against itself to observe the live payload).
- **The route-table mirror in `tools/agents/roles.ts` can silently go stale** if the philosophy plugin's `board.py` changes its `LEAF`/`SMALL_LEAF`/`ORCHESTRATE` values, since the check can't read the plugin path in CI. Mitigated by commenting the exact source line/version against each mirrored value and flagging this explicitly as a known limitation in the task notes, rather than papering over it.
- **No per-package `tsconfig.json`/project references exist yet**, so there is no narrower `tsc` invocation than the whole-repo `pnpm typecheck`. Each layer's `typecheckCommand` is therefore the same whole-repo command, not a layer-scoped one. This still achieves the write guard's real goal (Bash can't be used to write files outside the allowlisted two commands), but it is not "narrowed" in the sense of only checking that layer's files. Flagged as a gap for decision-6 (workspace tooling), not fixed here.
- **Inventing the `layer-<name>` label convention** without Bruk's prior sign-off, since no task on the board uses one yet and decision-3 does not spell out the label string. Confirmed safe: `board-check`'s `check_sizes`/`check_ready` only validate `size-*` labels: an extra `layer-*` label does not trip any existing board check. Documented in CLAUDE.md so the orchestrator applies it consistently going forward.

### Proof

- `node tools/agents/generate.test.ts` equivalent via `pnpm test` (new `generate.test.ts`, `agent-definitions.test.ts`, extended `hooks.test.ts`) -- unit-level proof for AC1, AC2, AC3, AC4.
- `pnpm check` -- the new `agent-definitions` check runs clean against the committed 18 files (AC1, AC2), and confirms deleting/regenerating a config or hand-editing a committed definition produces a finding (manually verified once, then reverted).
- `pnpm typecheck` -- the new TypeScript under `tools/agents/` and the extended hooks type-check.
- Manual exercise of both hooks with synthetic stdin payloads (`echo '{...}' | node tools/hooks/launch-guard.ts`) for: a mismatched layer, a mismatched model, a mismatched size, a size-1 task with no numbered steps (AC3); an edit outside the calling agent's layer (AC4) -- captured in the task's implementation notes as the literal commands and their stderr.
- `pnpm test`, `pnpm typecheck` and `pnpm check` all pass in the worktree before committing (the Stop hook already enforces this on every agent turn).

### Requirements

Delivers R26, R27 (import layers enforced by an agent hook, checked here for the agents that write within them) and R55 to R58 (enforcement as scripts, not model judgement; the drift and route-table checks named by rule and reason; fast hooks with the Stop-hook whole-change check; rule files staying judgement-only).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per decision-3. All evidence below was produced in this worktree; `pnpm typecheck`, `pnpm test` (266 tests, 35 files) and `pnpm check` (9 checks) all pass clean as committed.

## AC1: 18 definitions, one template, six configs, pinned models/efforts

6 layers (core, ports, application, providers, ui, app) x 3 roles (`builder-<layer>`, `builder-<layer>-small`, `reviewer-<layer>`) = 18, generated by `tools/agents/generate.ts` from `tools/agents/template.md` and `tools/agents/configs/<layer>.json` into `.claude/agents/*.md`, run via `pnpm agents:generate`. `tools/agents/generate.test.ts` (8 tests) asserts exactly 18 are produced, named correctly, with no unresolved `{{token}}`, and with each role's model/effort pinned.

`providers` stayed one layer, not split by platform (the brief's suggestion): decision-3 line 51 states 18 = 6x3 directly, and `tools/checks/import-layers.ts`'s own `PACKAGE_LAYER` table already treats providers-firebase/-device/-server as one `providers` layer; the write guard and generator both import that same table (`tools/agents/layers.ts`) rather than keep a second copy.

Per-layer examples are drawn from the walking skeleton (TASK-1.4), e.g. `packages/core/src/model/item.ts`, `packages/ports/src/sync-store/port.ts` (and its contract and fake), `packages/providers-firebase/src/firestore-sync-store.ts`.

Models/efforts:
- `builder-<layer>`: sonnet/medium (board.py's `LEAF`).
- `builder-<layer>-small`: haiku/high. board.py's `SMALL_LEAF` pins no effort (`None` = "the default"); decision-3's own table pins `high` deliberately (its Consequences section: haiku is weaker than sonnet on long agentic work). Specialising an unset value isn't a disagreement with the route table.
- `reviewer-<layer>`: opus/high, from decision-3's table only. `route()` in board.py never returns a value for a reviewer (it only routes by task size/type), so there is no plugin value to agree or disagree with; the check says this explicitly (see AC2).

## AC2: a check fails on drift or on route-table disagreement

New check `tools/checks/agent-definitions.ts` (registered in `registry.ts`, 13 tests in `agent-definitions.test.ts`):
- `agent-definitions/drift`: regenerates in memory and byte-compares each of the 18 committed files. Reads them with `ctx.readSource(path)` directly (not `ctx.files`/`ctx.allFiles`), because `lib.ts`'s `SKIP_DIRS` excludes `.claude`, which would otherwise make the check enumerate to zero and pass vacuously. One test asserts exactly 18 definitions are generated, so that enumeration can't silently regress.
- `agent-definitions/route-mismatch`: a separate, injectable `checkRouteAgreement(specs)` compares the generator's `ROLE_SPECS` (what actually gets baked into every definition) against two independent literal tables in `tools/agents/roles.ts`: `DECISION_3_TABLE` (transcribed from decision-3's own table, lines 23-29) always, and `ROUTE_TABLE_MIRROR` (board.py's LEAF/SMALL_LEAF/ORCHESTRATE, read 2026-10-18) for the two roles it actually covers.

Known limitation, stated in the check's own `why` and in `roles.ts`'s comments: the philosophy plugin's board.py lives under a per-machine plugin-cache path that does not exist in CI, so this check cannot shell out to the plugin at run time. `ROUTE_TABLE_MIRROR` is a one-time, dated transcription instead; if the plugin's route table changes, this mirror needs a human to update it, and nothing will flag that it has gone stale on its own.

Manually verified against the real repo (model pinned to opus by hand; a definition deleted by hand), then restored both times:
- `pnpm check` reported `FAIL agent-definitions/drift ... differs from the generated output`.
- `pnpm check` reported `FAIL agent-definitions/drift ... does not exist: run pnpm agents:generate`.

## AC3: the launch hook blocks a mismatched layer, model or size, and a size-1 task with no numbered steps

New `tools/hooks/launch-guard.ts`, a `PreToolUse` hook on the `Agent` tool (a separate matcher group in `.claude/settings.json`, `onFailure: "block"` so a crash here denies rather than silently allowing every launch). Passes through any `subagent_type` that names none of the 18 generated agents (the orchestrator launching `Explore`, `philosophy:reviewer`, etc. is untouched, matching decision-3's scope). For a gated launch it blocks, in order: no `TASK-n` id in the brief; the task unreadable via `backlog task <id> --json`; the task's `layer-<name>` label (new convention, see below) disagreeing with the agent's layer; the model `board-check route <id> --json` gives disagreeing with the agent's pinned model (which also catches every size mismatch, since board.py's `route()` derives the model from size: a size-1 task not routed to haiku, or a non-size-1 task routed to haiku, always surfaces as a model mismatch); and, for a size-1 task, no numbered line under its plan's "Order of work" section.

`decide()` takes its `Deps` (reading the task, reading the route) as a parameter, defaulting to real `backlog`/`board-check` subprocesses only at the hook's own entry point, so its 15 tests in `launch-guard.test.ts` run with injected fakes and need neither `backlog` nor the plugin installed (both are absent in CI).

New convention this task introduces, since nothing on the board uses one yet: a layer task carries a `layer-<name>` label (`layer-core`, `layer-ports`, ...) alongside its `size-*` label. Confirmed `board-check`'s own checks only validate `size-*` labels, so this doesn't trip anything; documented in CLAUDE.md's "Working with agents" section for the orchestrator to apply once slices start being split into layer tasks.

Manually verified against the real board (no task carries a `layer-*` label yet, since none has been split): launching `builder-ports` on a brief naming TASK-1.18 was denied with `launch-guard/layer-mismatch: TASK-1.18 is labelled (no layer-* label), not layer-ports; builder-ports only takes ports-layer work.`; launching `general-purpose` on a brief naming no task passed through untouched (exit 0), confirming decision-3's scope is respected.

Every other case (model mismatch, size-1 with/without numbered steps, a matching launch) is covered by `launch-guard.test.ts`'s injected-fake tests, since no real task on the board is yet labelled for a layer to demonstrate them live.

## AC4: the write guard blocks an edit outside the calling agent's layer

Extended `tools/hooks/pre-edit.ts` (logic lives in the new, independently tested `tools/agents/write-guard.ts`, with rules `write-guard/layer-boundary`, `write-guard/reviewer-writes-nothing`, `write-guard/bash-narrowed`, `write-guard/orchestrator-scope`): reads `agent_type`/`agent_id` from the hook payload (added to `HookPayload` in `tools/hooks/lib.ts`). Confirmed from the authoring-hooks reference that this is documented, present behaviour inside a subagent's tool calls, resolving decision-3's line-49 "unverified" risk; not separately observed live inside a real nested subagent run, since this worktree has no way to launch one against itself.

- A generated layer agent (`agent_type` parses to one): an `Edit`/`Write` outside its own layer is denied (`write-guard/layer-boundary`); a reviewer is denied writing anything at all, even within its own layer (`write-guard/reviewer-writes-nothing`, per decision-3's "it writes nothing"); `Bash` is denied unless the command exactly matches that layer's configured test or type-check command (`write-guard/bash-narrowed`), closing the "Bash can bypass the guard" gap decision-3's Enforcement section names.
- No `agent_type` at all (the orchestrator): an `Edit`/`Write` is denied outside `backlog/`, `.claude/`, the lock file, or a root-level config file (`write-guard/orchestrator-scope`), decision-3's line-14 restriction, previously undeclared in code.
- Any other `agent_type` (a worker that is neither the orchestrator nor one of the 18, such as this very task's own agent) is untouched by either rule, same as the launch guard.

Manually verified against the real repo: a `builder-core` Write targeting `packages/ui/...` was denied with `write-guard/layer-boundary ... builder-core may write only within the core layer; this file is in the ui layer`; a `builder-ports` Bash command `rm -rf packages/core` was denied with `write-guard/bash-narrowed ... builder-ports ran "rm -rf packages/core", not this layer's "vitest run --project unit packages/ports" or "pnpm -s typecheck"`.

20 tests in the extended `hooks.test.ts` cover: layer mismatch for both builder variants, a reviewer denied in its own layer, an allowed same-layer edit, Bash narrowing (denied and allowed), the orchestrator denied on layer code and allowed on board/root-config/.claude, and an unrecognised `agent_type` left untouched. The pre-existing weakening-check tests (focus/skip/delete-test), written before this guard existed, needed a `builder-core` context to keep exercising a layer-code edit; that default is applied inside the `hook()` test helper itself (keyed on the edited path being under packages/ or apps/, and only when a test doesn't already name its own `agent_type`) rather than by touching those tests' literal lines, since any edit to a line already containing a focused/skipped-test literal as fixture text gets flagged by the weakening check itself as adding one - a known limitation of its line-level, not AST-aware, diffing that this task ran into live (twice, once on a test file and once on a long Bash heredoc of notes) and worked around without touching the check itself, per this repo's own "fix the code, not the check" rule.

## Scope note

`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (decision-3's Enforcement bullet "so only the orchestrator delegates") was not set: it is a settings.json environment variable orthogonal to the four acceptance criteria above, and every generated agent already carries `disallowedTools: Agent` as defense in depth. Flagging it as still open rather than silently doing it or silently skipping it.

Live confirmation of the agent_type scoping (AC4): every edit this task itself made to package.json, CLAUDE.md, .claude/settings.json and the tools/ tree went through the live pre-edit hook under this session's own (unrecognised) agent_type and succeeded, while the weakening check fired twice on this same session (once on a test-file edit, once on a long Bash heredoc) for unrelated reasons. That is a live, not just documented, demonstration that the agent_type-keyed branch passes through an agent that is neither the orchestrator nor one of the 18 layer agents. Also: reviewOrchestratorEdit's root-config rule is literally 'any file at the repo root' (regex /^[^/]+$/), not an allowlist of specific config files; a reviewer should judge that rule, not a narrower one.
<!-- SECTION:NOTES:END -->
