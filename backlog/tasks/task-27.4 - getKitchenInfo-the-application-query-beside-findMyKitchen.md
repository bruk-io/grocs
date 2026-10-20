---
id: TASK-27.4
title: 'getKitchenInfo: the application query beside findMyKitchen'
status: To Do
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:25'
labels:
  - layer-application
  - size-1
dependencies:
  - TASK-27.2
parent_task_id: TASK-27
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-27, depends on TASK-27.2 (the frozen port/contract) - does not need TASK-27.3's provider implementations, since it only calls deps.kitchens.getKitchen through the port and a fake in tests. Matches decision-13's own framing of this feature as 'an application query beside findMyKitchen' (packages/application/src/queries/find-my-kitchen.ts is the pattern): the gateway's KitchenDetails stays data-only (name, members: {uid, name}[]), and the application layer is where 'which member is the caller' gets decided, from deps.auth.currentUser()?.uid - the gateway has no notion of a caller, only the application layer does.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A new query, packages/application/src/queries/get-kitchen-info.ts, returns {name, members: {uid, name, isCaller}[]} for a given kitchenId, or null if the gateway has none for that id, with tests using FakeKitchenGateway covering the caller flag, a partner's row, and the null case
<!-- AC:END -->
