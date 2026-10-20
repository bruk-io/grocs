---
id: TASK-27.4
title: 'getKitchenInfo: the application query beside findMyKitchen'
status: To Do
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:45'
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
- [x] #1 A new query, packages/application/src/queries/get-kitchen-info.ts, returns {name, members: {uid, name, isCaller}[]} for a given kitchenId, or null if the gateway has none for that id, with tests using FakeKitchenGateway covering the caller flag, a partner's row, and the null case
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented directly by the orchestrator together with the rest of the TASK-27 chain (see TASK-27.1's notes). packages/application/src/queries/get-kitchen-info.ts: getKitchenInfo(deps, kitchenId) calls deps.kitchens.getKitchen and marks isCaller from deps.auth.currentUser()?.uid, keeping the gateway's KitchenDetails data-only. Exported from the package's index.ts alongside findMyKitchen. Tests cover the caller flag, a partner's row, and the null case, using FakeKitchenGateway's new asMember(uid, displayName) and constructor display-name parameter.
<!-- SECTION:NOTES:END -->
