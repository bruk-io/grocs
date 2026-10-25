---
id: TASK-1.43
title: 'Logging: close decision-8''s gaps'
status: To Do
assignee: []
created_date: '2026-10-25 17:22'
updated_date: '2026-10-25 17:24'
labels:
  - architecture
  - size-5
dependencies: []
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-8 (accepted) answered D7 in full, but its own 'Gaps found reading the code' section lists six things the skeleton didn't build. R33 (global handlers) has since been built (observe.ts) - verified in code, not a gap anymore. The rest are still open, re-verified directly against the current code on 2026-10-25: kitchenRole is still hardcoded 'member' in native.ts, describeError withholds every SDK message unconditionally (a literal comment there says 'until GrocsError exists'), no key-value storage port exists at all (packages/ports/src has no kv module), the on-phone buffer is in-memory only with nothing to persist it, and watch* subscriptions get no per-subscription correlation id or onError/later-delivery logging. Split per decision-8's own design, sized before it starts.
<!-- SECTION:DESCRIPTION:END -->
