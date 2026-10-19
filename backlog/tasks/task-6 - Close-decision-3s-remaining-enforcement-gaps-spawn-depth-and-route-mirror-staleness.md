---
id: TASK-6
title: >-
  Close decision-3's remaining enforcement gaps: spawn depth and route-mirror
  staleness
status: To Do
assignee: []
created_date: '2026-10-19 00:32'
updated_date: '2026-10-19 03:28'
labels:
  - size-2
dependencies: []
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
- [ ] #1 CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH is set in .claude/settings.json, or decision-3 is amended to say why it is not
- [ ] #2 A stale ROUTE_TABLE_MIRROR is detected: the mirror is checked against the installed plugin's board.py where it is readable, and the check says so when it is not
<!-- AC:END -->
