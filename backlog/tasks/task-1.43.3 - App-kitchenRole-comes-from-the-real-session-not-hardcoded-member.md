---
id: TASK-1.43.3
title: 'App: kitchenRole comes from the real session, not hardcoded ''member'''
status: To Do
assignee: []
created_date: '2026-10-25 17:23'
updated_date: '2026-10-25 17:24'
labels:
  - layer-app
  - size-2
dependencies: []
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1.43
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
apps/mobile/src/composition/native.ts hardcodes runtime.kitchenRole: 'member'. decision-8 says it should be 'creator' or 'joiner', read from the kitchen document once a kitchen exists (R2, R3), and 'none' before then - the data already exists (Kitchen.members holds the creator first, per packages/core/src/model/kitchen.ts's own doc comment), this is wiring, not a new data model. Open question for whoever picks this up: runtime is currently fixed once at composition time and baked into every command's correlation.runtime, but which kitchen (and therefore which role) is known only once sign-in and kitchen lookup complete, after composition - how runtime becomes available/updatable post-composition is this task's own design call, not pre-decided here.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 kitchenRole in logged records reads 'creator' when the signed-in member is Kitchen.members[0], 'joiner' for any other member, and 'none' before a kitchen is found - never the literal 'member'
<!-- AC:END -->
