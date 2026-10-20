---
id: TASK-27
title: The app reads its kitchen's name and members
status: To Do
assignee: []
created_date: '2026-10-20 21:36'
updated_date: '2026-10-20 22:25'
labels:
  - size-3
dependencies:
  - TASK-27.1
  - TASK-27.2
  - TASK-27.3
  - TASK-27.4
modified_files:
  - packages/core/src/model/kitchen.ts
  - packages/ports/src/kitchen-gateway/port.ts
  - packages/ports/src/kitchen-gateway/fake.ts
  - packages/ports/src/kitchen-gateway/contract.ts
  - packages/providers-server/src/kitchen-store.ts
  - apps/functions/src/index.ts
  - packages/providers-firebase/src/kitchen-gateway.ts
  - packages/providers-memory/src/memory-kitchen-gateway.ts
  - packages/application/src/queries/get-kitchen-info.ts
  - firebase/firestore.rules.test.ts
  - apps/mobile/src/composition/compose-firebase.ts
  - apps/mobile/src/demo/compose-demo.ts
  - packages/providers-firebase/src/kitchen-gateway.emulator.test.ts
  - packages/providers-server/src/kitchen-store.emulator.test.ts
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the UI session's handoff (DRAFT-14): Settings and the Household screen still show sample text ('Our kitchen', 'your partner') and the Household invite card has no live Share or Copy, because nothing reads a kitchen's name or its members once it exists. Design settled (not in the original draft, recorded here so every subtask shares it): the kitchens/{kitchenId} Firestore document already allows allow read: if isMember(kitchenId) (R4) - no rules change needed, only a denormalized memberNames field and a test proving a member can read it. The Firebase client reads the kitchen document directly (FirestoreFns, like FirestoreSyncStore), not through a new Cloud Function - createKitchen/joinKitchen already capture the caller server-side and can read their display name from request.auth.token.name (a standard ID token claim Firebase Auth sets whenever the user's displayName is set - true for Google sign-in and for the dev email/password seed accounts alike, confirmed in firebase/seed/seed.ts's createUser call), so the gateway's createKitchen/joinKitchen method signatures do not change. Split across the layers per decision-3: TASK-27.1 (core), TASK-27.2 (ports, the contract frozen there), TASK-27.3 (providers) and TASK-27.4 (application) carry the per-layer work. This task is what's left once all four land: apps/functions (outside the six generated layers, orchestrator territory) and the two composition roots (constructor wiring only, no screens).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 createKitchen and joinKitchen in apps/functions/src/index.ts read request.auth.token.name (fall back to '' if absent) and pass it to the store calls, so a real kitchen document actually gets a populated memberNames
- [ ] #2 apps/mobile/src/composition/compose-firebase.ts and apps/mobile/src/demo/compose-demo.ts pass their already-available Firestore/display-name values into the updated FirebaseKitchenGateway/MemoryKitchenGateway constructors
- [ ] #3 firebase/firestore.rules.test.ts proves a member can read their kitchen's memberNames field through the existing rule, and a non-member or signed-out request still cannot
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
Design settled before planning (not in the draft, worth recording): the kitchens/{kitchenId} Firestore document already allows allow read: if isMember(kitchenId) (R4) - the existing rule already covers this, so no rules change is needed, only a denormalized memberNames field and a test proving a member can read it. The Firebase client reads the kitchen document directly (FirestoreFns, like FirestoreSyncStore), not through a new Cloud Function - createKitchen/joinKitchen already capture the caller's display name server-side from request.auth.token.name (a standard ID token claim Firebase Auth always sets when the user's displayName is set, Google sign-in and the dev email/password seed accounts alike), so the gateway's createKitchen/joinKitchen method signatures do not change. FakeKitchenGateway and MemoryKitchenGateway, which stand in for the whole client+server system in one object, take an optional display name in their constructor instead.

1. Core (packages/core/src/model/kitchen.ts): Kitchen gains memberNames: Readonly<Record<string, string>> (uid -> display name); NewKitchenInput gains ownerName: string; createKitchen seeds memberNames with the owner; addMember(kitchen, uid, name) gains a name parameter and adds it to memberNames. KITCHEN_SCHEMA_VERSION stays at 1 (nothing reads/validates it against a Kitchen document, unlike item-doc.ts).
2. Ports (packages/ports/src/kitchen-gateway/port.ts): add KitchenDetails ({name, members: readonly {uid, name}[]}) and KitchenGateway.getKitchen(kitchenId): Promise<KitchenDetails | null>. createKitchen/joinKitchen signatures unchanged.
3. Fake (packages/ports/src/kitchen-gateway/fake.ts): constructor takes an optional displayName (default: the uid itself); getKitchen scans its in-memory kitchens map.
4. Contract (packages/ports/src/kitchen-gateway/contract.ts): new getKitchen cases - returns the right name and members (with display names) after a solo create, after a second member joins, and null for an unknown id.
5. providers-server (packages/providers-server/src/kitchen-store.ts): createKitchen(name, timeZone, ownerUid, ownerName) and joinKitchen(code, callerUid, callerName) pass the name through to core; add getKitchen(kitchenId): Promise<KitchenDetails | null>, a plain doc read via the Admin SDK, for the store's own contract-adapter test.
6. apps/functions (apps/functions/src/index.ts): createKitchen and joinKitchen read request.auth.token.name (fall back to '' if absent) and pass it to the store calls. No new callable - getKitchen is a direct client read, not a function.
7. providers-firebase (packages/providers-firebase/src/kitchen-gateway.ts): constructor also takes (fs: FirestoreFns, db: unknown), alongside the existing (fns, functionsInstance); getKitchen reads kitchens/{kitchenId} directly and maps members + memberNames into KitchenDetails. Update both call sites: apps/mobile/src/composition/compose-firebase.ts (already has firebase.firestore/firebase.db in scope for FirestoreSyncStore) and packages/providers-firebase/src/kitchen-gateway.emulator.test.ts (createEmulatorClient already returns firestoreFns/db).
8. providers-memory (packages/providers-memory/src/memory-kitchen-gateway.ts): constructor takes an optional displayName (default: callerUid), matching the fake; getKitchen scans its shared in-memory kitchens map. apps/mobile/src/demo/compose-demo.ts passes DEMO_MEMBER.displayName through.
9. Application (packages/application/src/queries/, beside find-my-kitchen.ts): a new getKitchenInfo(deps, kitchenId) query returning {name, members: {uid, name, isCaller}[]} or null, marking isCaller from deps.auth.currentUser()?.uid - matches decision-13's 'application query beside findMyKitchen' framing, keeping the gateway's return data-only and the caller flag at the application layer.
10. firebase/firestore.rules.test.ts: extend seedKitchen to include memberNames and add a case proving a member can read it (the existing rule, no new one) and a non-member still cannot.
11. Run pnpm check, typecheck, test, test:emulator (including the Firebase gateway's contract suite now exercising getKitchen through the real Cloud Functions-adjacent emulator client and rules), check:demo, check:release.

### Risks
- Scope boundary: apps/mobile/src/composition/compose-firebase.ts and apps/mobile/src/demo/compose-demo.ts are composition-root wiring (constructor arguments only, no screens, no UI) - the same boundary already crossed for TASK-23 this session. No packages/ui or apps/mobile screen touched.
- request.auth.token.name can be undefined for an identity provider or a manually-created test account with no displayName; falling back to '' rather than throwing keeps createKitchen/joinKitchen from failing over a missing name, and the UI's own fallback (if any) is someone else's concern.
- KITCHEN_SCHEMA_VERSION is not bumped because nothing validates a Kitchen document against it; if that changes later, this field addition would need revisiting, but it is not a reason to invent a migration now.

### Proof
pnpm check (expect a new check count unaffected since this task adds no new check), typecheck, test, test:emulator all green; the shared kitchenGatewayContract's new getKitchen cases pass for the fake, in-memory, server-adapter and real Firebase (through the emulator) subjects alike; firestore.rules.test.ts proves a member reads memberNames and a non-member or signed-out request does not.
<!-- SECTION:PLAN:END -->
