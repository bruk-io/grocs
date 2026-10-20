---
id: TASK-27.2
title: 'KitchenGateway.getKitchen: the port, fake and contract'
status: To Do
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:44'
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
- [x] #1 KitchenGateway gains getKitchen(kitchenId): Promise<KitchenDetails | null> (KitchenDetails: {name, members: readonly {uid, name}[]}); FakeKitchenGateway implements it, with an optional display name in its constructor (default: the uid itself)
- [x] #2 kitchenGatewayContract gains getKitchen cases: structure after a solo create, structure after a second member joins (both members present, each with a defined name), and null for an id nobody created
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented directly by the orchestrator together with the rest of the TASK-27 chain (see TASK-27.1's notes for why: the chain cannot be split across separate commits, since lefthook's pre-commit hook always runs whole-repo typecheck/test). KitchenGateway gains getKitchen(kitchenId): Promise<KitchenDetails | null>; KitchenDetails/KitchenMemberDetails exported from @grocs/ports. FakeKitchenGateway takes an optional display name in its constructor (default: the uid), and asMember takes an optional display name too (default: the uid). The shared contract's three new getKitchen cases are structural only, per the design review that caught this during planning: member uid presence and a defined name per member, not exact name content, since the Firebase subject's real identity and the fake's default differ and neither should have to fake the other's shape.
<!-- SECTION:NOTES:END -->
