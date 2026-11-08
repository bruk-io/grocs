---
id: TASK-27.3
title: 'getKitchen in the server store, Firebase and in-memory providers'
status: Done
assignee: []
created_date: '2026-10-20 22:24'
updated_date: '2026-10-20 22:50'
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
- [x] #1 KitchenStore (providers-server) gains ownerName/callerName parameters on createKitchen/joinKitchen, written into memberNames, and a getKitchen(kitchenId) method; its own emulator test's contract-adapter wires it into the shared getKitchen contract cases
- [x] #2 FirebaseKitchenGateway.getKitchen reads kitchens/{kitchenId} directly over FirestoreFns, maps memberNames defensively, and returns null (not a thrown permission-denied) for an id nobody created; passes the shared contract through the real Cloud Functions-backed emulator client, plus a Firebase-specific test (using the seeded bruk/sam accounts, which do carry a real displayName/ID-token name) proving an actual display name round-trips end to end
- [x] #3 MemoryKitchenGateway takes an optional display name in its constructor (default: the caller uid) and implements getKitchen from its shared in-memory state, passing the shared contract
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented directly by the orchestrator together with the rest of the TASK-27 chain (see TASK-27.1's notes). KitchenStore.createKitchen/joinKitchen gain ownerName/callerName parameters, written into memberNames in the same batch/transaction as the existing writes; KitchenStore.getKitchen is a plain Admin SDK doc read, wired into its emulator test's gatewayFor adapter, which now also passes a display name per uid. FirebaseKitchenGateway's constructor also takes (fs: FirestoreFns, db: unknown); getKitchen reads kitchens/{kitchenId} directly (FirestoreFns.getDoc, newly added to the shared SDK slice - both the web and native modular APIs already export it) and catches permission-denied specifically, returning null to match every other provider's answer for an id nobody created (isMember() errors indexing .data.members on a document that does not exist, which Firestore surfaces as permission-denied rather than revealing non-existence). apps/mobile/src/composition/compose-firebase.ts and the emulator test file pass the already-available firestore/db through. A Firebase-specific test using the seeded bruk/sam accounts (whose ID tokens carry real name claims) proves actual display names round-trip end to end, beyond the shared contract's structural-only cases; another documents that getKitchen answers null rather than throwing for a signed-out caller, unlike the callable-backed methods, since it is a direct Firestore read where the rule denies a signed-out read the same way it denies a non-member one. MemoryKitchenGateway takes an optional display name (default: the uid) and implements getKitchen from its shared state; apps/mobile/src/demo/compose-demo.ts passes DEMO_MEMBER.displayName through to both the direct core.createKitchen seeding call and the gateway constructor. pnpm test:emulator: 80 tests (up from 70), run twice clean.

Closed on review. All three criteria verified in f09d034. AC1: KitchenStore.createKitchen/joinKitchen gain ownerName/callerName written into memberNames inside the same batch/transaction as the existing writes, KitchenStore.getKitchen is a plain Admin SDK doc read, and the emulator test's gatewayFor adapter now supplies a per-caller display name and wires getKitchen into the shared contract. AC2: FirebaseKitchenGateway.getKitchen reads kitchens/{kitchenId} over FirestoreFns.getDoc, maps memberNames defensively (memberNames?.[uid] ?? uid), and its catch is scoped - isPermissionDenied checks error.code === 'permission-denied' specifically and rethrows everything else, so no other failure is swallowed. The Firebase-specific test signs in the seeded bruk and sam accounts and asserts the exact names (details?.members.map(m => m.name).sort() toEqual ['Bruk','Sam']) plus the kitchen name, so a real display name genuinely round-trips beyond the contract's structural cases. AC3: MemoryKitchenGateway takes an optional display name defaulting to the uid and implements getKitchen from its shared state. Also checked, since nothing in the type system would have caught it: getDoc, newly added to the FirestoreFns slice consumers reach through asSdk's structural cast, is really exported by both namespaces the composition roots pass - firebase/firestore for the web/emulator client, and @react-native-firebase/firestore for the phones (via its built modular/query re-export) - so the device path will not throw on a missing member. Criteria were already ticked in the implementing commit; genuinely met, reported as a process note. Reviewer verification on TASK-27, including two clean emulator runs.
<!-- SECTION:NOTES:END -->
