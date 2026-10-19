---
id: TASK-6
title: >-
  Close decision-3's remaining enforcement gaps: spawn depth and route-mirror
  staleness
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 00:32'
updated_date: '2026-10-19 04:06'
labels:
  - size-2
dependencies: []
modified_files:
  - .claude/settings.json
  - tools/checks/lib.ts
  - tools/checks/run.ts
  - tools/checks/agent-definitions.ts
  - tools/checks/agent-definitions.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two parts of decision-3's Enforcement section are not enforced after TASK-1.18, both flagged honestly by its worker rather than hidden.

1. CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH is unset. decision-3's Enforcement says it is set in the repo's settings 'so only the orchestrator delegates'. `grep -rn SPAWN_DEPTH .claude/` finds nothing. Each of the 18 generated definitions carries `disallowedTools: Agent` as defence in depth, so the realistic failure is narrow, but the declared control does not exist.

2. tools/agents/roles.ts's ROUTE_TABLE_MIRROR is a hand-dated transcription of philosophy 0.4.6's board.py lines 58-60 (ORCHESTRATE opus/high, LEAF sonnet/medium, SMALL_LEAF haiku/None). Verified accurate on 2026-10-18. Nothing detects it going stale: the agent-definitions check cannot read ~/.claude/plugins/cache in CI, so a plugin route-table change silently leaves every generated definition pinned to the wrong model with a green check. The limitation is documented in the check's own 'why', but undetected.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH is set in .claude/settings.json, or decision-3 is amended to say why it is not
- [x] #2 A stale ROUTE_TABLE_MIRROR is detected: the mirror is checked against the installed plugin's board.py where it is readable, and the check says so when it is not
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. AC1 (spawn depth): confirm CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH is a real, recognized Claude Code env var (via the installed binary's own strings, not memory) and work out its semantics (depth at which a launch is refused) before touching settings. Add it to .claude/settings.json under a new top-level "env" key as the string "1" (schema requires string values), which matches decision-3's 'only the orchestrator delegates' given the binary's own refusal message ('depth N of CAP') and the existing defense-in-depth (disallowedTools: Agent on every layer agent).
2. AC2 (route-mirror staleness): extend tools/checks/agent-definitions.ts rather than write a new check file, since it already owns ROUTE_TABLE_MIRROR comparisons:
   - add a pure function checkRouteMirrorFreshness(boardPySource: string | null) that: returns no findings plus a clear note when boardPySource is null (plugin unreadable, e.g. in CI); returns a finding when a Route(...) line can't be parsed; returns a finding per mismatch between ROUTE_TABLE_MIRROR and the parsed values otherwise.
   - add a thin I/O wrapper readPluginBoardPySource() (homedir lookup under .claude/plugins/cache/knowhere/philosophy, latest version, scripts/board.py; GROCS_PLUGIN_BOARD_PY env override for tests) that does the actual disk read and never throws.
   - wire checkRouteMirrorFreshness's findings into run(), and its note into a new optional notes() on the check (an unreadable plugin is reported, not silently passed, but must not fail CI forever).
3. Add an optional notes?(ctx) method to the Check interface in tools/checks/lib.ts, and have tools/checks/run.ts print every check's notes alongside the pass/fail report, without counting them in the finding total or the exit code.
4. Tests in tools/checks/agent-definitions.test.ts covering all three states of checkRouteMirrorFreshness (unreadable -> note only, unparseable -> finding, mismatched -> finding, matching real board.py text -> clean) plus one read through readPluginBoardPySource() using GROCS_PLUGIN_BOARD_PY against a real temp file, so AC2 isn't only proven on a machine that happens to have the plugin cache.
5. Run pnpm check && pnpm typecheck && pnpm test, record the output in implementation notes, tick both ACs, append notes, commit.

### Risks
- CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH's exact depth semantics are read from the installed binary's minified strings, not official docs; I will state in the notes exactly what I verified (the env var name, its int/min:1 validation, and the refusal message shape) versus what I inferred (that depth 0 is the orchestrator) rather than assert the latter as confirmed.
- Treating notes as a new Check.notes? concept is a small addition to shared check infrastructure (lib.ts, run.ts); kept additive only (no existing behavior removed) so weakening.ts's loosen-check-config review has nothing to flag.
- .claude/settings.json is check-config (weakening.ts's isCheckConfig); the env block is a pure addition so it should not trip the loosen-check-config review, but I will watch the pre-commit hook output.

### Proof
- pnpm check, pnpm typecheck, pnpm test all exit 0, pasted into implementation notes.
- New tests fail before the fix (route-mirror ones) and pass after.
- grep -n SPAWN_DEPTH .claude/settings.json shows the new line.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
AC1 (spawn depth): .claude/settings.json now sets env.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH = "1" (settings schema requires string values under env.*). Verified via 'strings' on the installed Claude Code binary (~/.local/share/claude/versions/2.1.303) that the env var is real, parsed with min:1 int validation, and that a launch is refused when the launching context's depth is >= the cap, with the message 'Subagent nesting limit reached (depth N of CAP)'. A cap of 1 therefore lets the orchestrator (depth 0) launch, and denies a launch from any agent the orchestrator spawned (depth >= 1) -- matching decision-3's 'only the orchestrator delegates'. I could not locate the minified depth-counting function (hp(agentContext)) with confidence in the bundle to directly confirm depth 0 means the main session, so that one inference rests on the min:1 bound and the refusal message shape, not a direct read of that function -- flagging this rather than asserting it as fully verified. No decision-3 amendment needed since the setting does exist and makes sense in this schema.

AC2 (route-mirror staleness): extended tools/checks/agent-definitions.ts rather than adding a new check file, since it already owns ROUTE_TABLE_MIRROR:
- checkRouteMirrorFreshness(boardPySource) is a pure function with three outcomes: boardPySource === null (plugin unreadable, e.g. CI) -> no findings, a clear note; readable but a Route(...) line doesn't parse -> a finding (agent-definitions/route-mirror-stale), not treated as a pass; readable, parsed, and any of ORCHESTRATE/LEAF/SMALL_LEAF disagrees with ROUTE_TABLE_MIRROR -> a finding naming both values.
- readPluginBoardPySource() is the thin, never-throwing I/O wrapper (homedir lookup under ~/.claude/plugins/cache/knowhere/philosophy/<latest version>/scripts/board.py, overridable via GROCS_PLUGIN_BOARD_PY for tests, following the existing GROCS_BOARD_CHECK precedent in tools/hooks/launch-guard.ts).
- Added an optional Check.notes?(ctx) to tools/checks/lib.ts: visible, non-failing status lines, never counted toward the finding total or exit code. tools/checks/run.ts now prints every check's notes alongside the pass/fail report in every mode.
- agent-definitions check wires checkRouteMirrorFreshness's findings into run() and its note into notes().

Verification:
- pnpm check: 'checks passed (9 checks, all mode, ...)' -- clean, and manually confirmed the unreadable-plugin path by running 'GROCS_PLUGIN_BOARD_PY=/nonexistent/board.py node tools/checks/run.ts --mode all', which printed 'note: could not read the installed philosophy plugin's board.py (not found on disk, e.g. in CI) -- ROUTE_TABLE_MIRROR in tools/agents/roles.ts was not checked against it this run.' and still exited 0 -- the gap is reported, not silently passed, and does not fail CI.
- pnpm typecheck: clean (tsc --noEmit, no errors).
- pnpm test: 283 passed (35 files), including 16 new/existing tests in tools/checks/agent-definitions.test.ts covering all three states of checkRouteMirrorFreshness (matching real board.py text, unreadable, model mismatch, effort mismatch, unparseable route) plus readPluginBoardPySource's real disk I/O via a temp file and a nonexistent-path case.
- No Firebase/emulator-backed code touched, so pnpm test:emulator was not run.
- Scope held to .claude/settings.json, tools/checks/lib.ts, tools/checks/run.ts, tools/checks/agent-definitions.ts, tools/checks/agent-definitions.test.ts -- no packages/ui or apps/mobile screens touched.
<!-- SECTION:NOTES:END -->
