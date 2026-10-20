---
id: TASK-27.2
title: 'KitchenGateway.getKitchen: the port, fake and contract'
status: To Do
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:25'
labels:
  - layer-ports
  - size-2
dependencies:
  - TASK-27.1
parent_task_id: TASK-27
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-27, depends on TASK-27.1 (Kitchen gains memberNames). Adds the one new port method the rest of the slice builds on: KitchenGateway.getKitchen(kitchenId), returning the kitchen's name and its members' uids and display names, or null for an id nobody has. Contract design note from the parent task's advisor review: the shared contract suite must stay structural (member uids present, each with a defined name) rather than asserting exact display-name content, because the Firebase subject's real identity (its ID token's name claim) and the fake's default naming scheme are different and neither should have to fake the other's shape. Exact display-name content is each provider's own test to make, once providers-firebase and providers-memory exist (TASK-27.3).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 KitchenGateway gains getKitchen(kitchenId): Promise<KitchenDetails | null> (KitchenDetails: {name, members: readonly {uid, name}[]}); FakeKitchenGateway implements it, with an optional display name in its constructor (default: the uid itself)
- [ ] #2 kitchenGatewayContract gains getKitchen cases: structure after a solo create, structure after a second member joins (both members present, each with a defined name), and null for an id nobody created
<!-- AC:END -->
