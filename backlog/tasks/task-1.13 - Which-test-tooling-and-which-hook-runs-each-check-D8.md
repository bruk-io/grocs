---
id: TASK-1.13
title: 'Which test tooling, and which hook runs each check? (D8)'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:01'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies:
  - TASK-1.4
references:
  - >-
    backlog/decisions/decision-9 -
    Tests-vitest-Maestro-declared-check-tiers-and-new-checks.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D8 in doc-1: test runners, the end-to-end tool and which flows it covers (R51), check scripts and hooks, judgement-only rules, mutation testing later (R46 to R58).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-9 on 2026-10-18. Includes a reproduced gap: vitest 4 projects ignore the root allowOnly unless extends is set. Waiting on Bruk to accept.
<!-- SECTION:NOTES:END -->
