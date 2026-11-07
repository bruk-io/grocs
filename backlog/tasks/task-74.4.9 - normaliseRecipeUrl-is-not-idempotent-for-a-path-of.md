---
id: TASK-74.4.9
title: normaliseRecipeUrl is not idempotent for a path of '//'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 03:20'
labels:
  - size-1
  - layer-providers
dependencies: []
parent_task_id: TASK-74.4
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract section 9 step 4 (amended 2026-11-07) strips every trailing slash. The merged normalise-url.ts strips one, so https://x.com// normalises to https://x.com/ and then to https://x.com, breaking the contract's idempotence rule. Found by reviewer-providers on TASK-74.4.3.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 normaliseRecipeUrl strips every trailing slash from the path: https://x.com// and https://x.com/ give https://x.com, and https://x.com/a// gives https://x.com/a
- [ ] #2 normalise-url.test.ts has those cases in its golden table and an idempotence test over the whole table, and the providers unit tests and typecheck pass
<!-- AC:END -->
