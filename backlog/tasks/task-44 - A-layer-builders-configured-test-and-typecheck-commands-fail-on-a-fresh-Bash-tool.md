---
id: TASK-44
title: >-
  A layer builder's configured test and typecheck commands fail on a fresh Bash
  tool
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-22 19:21'
updated_date: '2026-10-22 19:30'
labels:
  - size-2
dependencies: []
modified_files:
  - tools/hooks/stop.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found while re-verifying TASK-42's AC2. Every layer config in tools/agents/configs/*.json sets testCommand to a bare `vitest run --project ...` invocation and typecheckCommand to `pnpm -s typecheck`. write-guard.ts's reviewLayerBash requires an EXACT string match against these two values (no mise exec prefix reachable there), and the generated agent definitions (tools/agents/template.md's {{TEST_COMMAND}}/{{TYPECHECK_COMMAND}}) tell a layer builder to run exactly these strings.

Verified with two independent fresh general-purpose agents (not this long-lived session, which has its own known stale-PATH issue - confirmed this is NOT that):
1. A fresh agent's own Bash tool PATH has mise's installs/node/22/bin ahead of mise/shims, so `node --version` resolves to v22.21.1 even though mise.toml pins >=24.12 and `mise current node`/`mise exec -- node --version` correctly report 24.22.0.
2. The literal typecheckCommand (`pnpm -s typecheck`) fails with ERR_PNPM_UNSUPPORTED_ENGINE under that ambient Node.
3. The literal testCommand (e.g. `vitest run --project unit packages/core`) separately fails with "command not found: vitest" in every shell tried (login or not, fresh agent or this session) - node_modules/.bin is never on PATH outside a pnpm-run script context, so a bare vitest invocation never resolves, independent of Node version.

Confirmed fix direction with a fresh agent: `mise exec -- pnpm -s typecheck` and `mise exec -- pnpm exec vitest run --project unit packages/core` both run clean (v24.22.0, 70/70 tests passed). Likely fix: change each config's testCommand/typecheckCommand to the mise exec + pnpm exec forms, regenerate agent definitions (`pnpm agents:generate`), and confirm write-guard's exact-match still works against the new strings.

## Affected users and systems
tools/agents/configs/*.json (all 6 layers), tools/agents/write-guard.ts, the generated .claude/agents/*.md files, decision-3's architecture (every layer builder's ability to run its own checks on a fresh worktree).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A fresh agent (not this session) running the exact literal testCommand and typecheckCommand strings from each of the 6 layer configs succeeds on a fresh worktree with no manual Node-version or PATH workaround
- [x] #2 write-guard.ts's exact-match check (reviewLayerBash) still correctly allows the updated commands and rejects everything else; its unit tests updated accordingly
- [x] #3 pnpm agents:generate run with no drift, and pnpm check's agent-definitions check passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In each of the 6 tools/agents/configs/*.json files, change typecheckCommand to `mise exec -- pnpm -s typecheck` and testCommand to `mise exec -- pnpm exec <the existing vitest invocation>` (e.g. `mise exec -- pnpm exec vitest run --project unit packages/core`), keeping each layer's existing vitest project/path arguments unchanged.
2. Run `pnpm agents:generate` to regenerate .claude/agents/*.md from the updated configs; confirm `pnpm check`'s agent-definitions/drift check passes with no manual edits to the generated files.
3. Check write-guard.ts's reviewLayerBash: it already compares the trimmed Bash command against config.testCommand/config.typecheckCommand verbatim, so no code change should be needed there - the exact-match now succeeds against the new (working) strings instead of the old (broken) ones. Update write-guard.test.ts's fixtures/expectations if any hardcode the old literal command strings.
4. Verify end to end with a fresh general-purpose agent (not this session): run the exact literal testCommand and typecheckCommand strings now configured, in a fresh scratch worktree, confirm both succeed with no manual mise/PATH workaround from the agent itself.
5. Run pnpm check, pnpm typecheck, pnpm test from the main checkout; commit and push.

### Risks
- mise must actually be on PATH for every Bash tool invocation on this machine (confirmed true for at least two independent fresh agents tested during investigation) - if some future environment lacks mise, these commands would break again, but that is true of this whole repo's toolchain already (mise.toml pins Node/Java repo-wide) and not a new risk this introduces.
- Only tools/agents/ (config + generated files) and their tests change; no layer code, no runtime application behaviour affected.

### Proof
A fresh (non-orchestrator-session) agent running the exact configured testCommand and typecheckCommand strings for at least one layer in a scratch worktree, succeeding with no manual intervention. pnpm agents:generate producing no diff beyond the intended command-string changes. pnpm check (agent-definitions/drift and write-guard's own tests) green.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan drift: the write-guard tests live in tools/hooks/hooks.test.ts, not a separate write-guard.test.ts. Also extended the fix beyond testCommand/typecheckCommand to ui.json's extraCommands, which have the identical engines-check failure mode under the wrong ambient Node (same root cause, same files, no separate risk).

Fixed: all 6 layer configs' testCommand/typecheckCommand (and ui.json's extraCommands) now prefixed with 'mise exec --' (test commands additionally go through 'pnpm exec' to resolve the vitest binary, which is never on PATH outside a pnpm-run script context). Regenerated .claude/agents/*.md via pnpm agents:generate - no drift, pnpm check's agent-definitions check passes. Updated tools/hooks/hooks.test.ts's two hardcoded literal-command fixtures to match. Verified end to end with an independent fresh general-purpose agent: created a scratch worktree, ran the exact new typecheckCommand and testCommand (core layer) directly via its own Bash tool - both exited 0 (tsc clean; 10 files/70 tests passed), cleaned up after. Also fixed tools/hooks/stop.ts, which has been causing this whole session's recurring 'typecheck/unit tests failed: ERR_PNPM_UNSUPPORTED_ENGINE' Stop-hook false alarms - same root cause (bare pnpm/node spawned without resolving mise's shims); now runs every step through mise exec. Full suite green: pnpm check (14), pnpm typecheck, pnpm test (117 files/1545 tests).

AC1 follow-up: the earlier verification only ran core's commands. A fresh agent ran all 6 layers' exact testCommand strings (core, application, ports, providers, ui, app) directly via its own Bash tool in one scratch worktree - all 6 passed (97 test files, 1240 tests, 0 failures total). typecheckCommand is identical across all 6 configs, already verified. Cleanup confirmed.
<!-- SECTION:NOTES:END -->
