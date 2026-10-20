---
id: TASK-27.3
title: 'getKitchen in the server store, Firebase and in-memory providers'
status: To Do
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:25'
labels:
  - layer-providers
  - size-3
dependencies:
  - TASK-27.2
parent_task_id: TASK-27
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-27, depends on TASK-27.2 (the frozen port/contract). Implements getKitchen for every provider, and passes a display name through createKitchen/joinKitchen's existing write paths so the field it reads is actually populated.

packages/providers-server/src/kitchen-store.ts: createKitchen and joinKitchen gain an ownerName/callerName parameter, written into the kitchen document's memberNames alongside the existing members write (same batch/transaction, same atomicity reasoning already in the file's own comments). Add getKitchen(kitchenId): a plain Admin SDK doc read, used by this package's own contract-adapter test.

packages/providers-firebase/src/kitchen-gateway.ts: constructor also takes (fs: FirestoreFns, db: unknown) alongside the existing (fns, functionsInstance) - a direct Firestore read, the same pattern FirestoreSyncStore already uses, not a new Cloud Function (kitchens/{kitchenId} is already readable by its members, R4). Two real subtleties from the parent task's design review: (1) reading memberNames?.[uid] ?? '' defensively, since an older or differently-seeded kitchen document may not have the field; (2) a kitchenId nobody created makes isMember() error inside the rule (it indexes .data.members on a document that doesn't exist), which Firestore surfaces to the client as permission-denied, not not-found - getKitchen must catch that specific error code and return null, to match every other provider's null-for-unknown-id behaviour rather than throwing.

packages/providers-memory/src/memory-kitchen-gateway.ts: constructor takes an optional display name (default: the caller uid), matching FakeKitchenGateway; getKitchen scans its shared in-memory kitchens map.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 KitchenStore (providers-server) gains ownerName/callerName parameters on createKitchen/joinKitchen, written into memberNames, and a getKitchen(kitchenId) method; its own emulator test's contract-adapter wires it into the shared getKitchen contract cases
- [ ] #2 FirebaseKitchenGateway.getKitchen reads kitchens/{kitchenId} directly over FirestoreFns, maps memberNames defensively, and returns null (not a thrown permission-denied) for an id nobody created; passes the shared contract through the real Cloud Functions-backed emulator client, plus a Firebase-specific test (using the seeded bruk/sam accounts, which do carry a real displayName/ID-token name) proving an actual display name round-trips end to end
- [ ] #3 MemoryKitchenGateway takes an optional display name in its constructor (default: the caller uid) and implements getKitchen from its shared in-memory state, passing the shared contract
<!-- AC:END -->
