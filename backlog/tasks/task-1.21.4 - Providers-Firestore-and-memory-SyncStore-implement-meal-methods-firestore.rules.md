---
id: TASK-1.21.4
title: >-
  Providers: Firestore and memory SyncStore implement meal methods;
  firestore.rules
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:13'
labels:
  - layer-providers
  - size-3
dependencies:
  - TASK-1.21.2
modified_files:
  - packages/providers-firebase/src/firestore-sync-store.ts
  - packages/providers-firebase/src/firestore-sync-store.emulator.test.ts
  - packages/providers-memory/src/memory-sync-store.ts
  - packages/providers-memory/src/memory-sync-store.test.ts
  - firebase/firestore.rules.test.ts
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mirrors packages/providers-firebase/src/firestore-sync-store.ts's and packages/providers-memory/src/memory-sync-store.ts's existing item methods exactly for the new meal methods added to the SyncStore port. Depends on the ports contract (TASK-1.21.2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FirestoreSyncStore implements mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId}, same transaction-based merge-on-write pattern as mergeItem
- [ ] #2 MemorySyncStore implements the same methods in-memory, for the demo build and app-layer tests
- [ ] #3 firebase/firestore.rules gains kitchens/{kitchenId}/meals/{mealId} rules mirroring items' member-only read/write, with allow/deny tests added to firestore.rules.test.ts
- [ ] #4 Emulator tests cover the real Cloud Firestore round trip for every meal method, including a concurrent-write merge test
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. MemorySyncStore (packages/providers-memory/src/memory-sync-store.ts): add #meals/#mealWatchers mirroring InMemorySyncStore's (ports fake) exact shape - mergeMeal/getMeals/watchMeals, #selectMeals filtering on meal.weekId.value since weekId is Stamped.
2. FirestoreSyncStore (packages/providers-firebase/src/firestore-sync-store.ts): mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId}, mirroring mergeItem's transaction pattern exactly, using decodeMeal/encodeMeal/mergeMeal from @grocs/core. Query on 'weekId.v' (not 'weekId') since Meal's stored weekId is nested (StoredField), unlike Item's plain weekId.
3. memory-sync-store.test.ts: call syncStoreMealContract alongside syncStoreContract.
4. firestore-sync-store.emulator.test.ts: call syncStoreMealContract alongside syncStoreContract (covers AC4's concurrent-write merge case against the real emulator).
5. firestore.rules: already generically covers any kitchens/{kitchenId}/{collection}/{document} via the existing {document=**} rule (comment already names meals) - no rule change needed. Add an explicit meals-focused allow/deny test to firestore.rules.test.ts for AC3's documentation requirement.
6. Run pnpm exec vitest run --project unit packages/providers-memory packages/providers-firebase, then full pnpm test, pnpm test:emulator, pnpm check, pnpm typecheck.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented MemorySyncStore (packages/providers-memory/src/memory-sync-store.ts) and FirestoreSyncStore (packages/providers-firebase/src/firestore-sync-store.ts) meal methods, mirroring each store's existing item methods exactly. Firestore: mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId}, same transaction-based merge-on-write as mergeItem, using decodeMeal/encodeMeal/mergeMeal from @grocs/core. Query/watch filter on 'weekId.v' (not 'weekId'), since Meal's stored weekId is a nested StoredField ({v,at,by}), unlike Item's plain string weekId - this is the one real divergence from the item pattern, called out in TASK-1.21.1's forward notes. Memory: #meals/#mealWatchers mirroring #items/#watchers in both MemorySyncStore and the ports fake (InMemorySyncStore), filtering on meal.weekId.value.

memory-sync-store.test.ts and firestore-sync-store.emulator.test.ts both now call syncStoreMealContract (from @grocs/ports/testing) alongside the existing syncStoreContract - this is what proves the concurrent-edit merge case (AC4) against the real Firestore emulator, not just the fake.

firebase/firestore.rules: no rule change - the existing kitchens/{kitchenId}/{collection}/{document=**} rule is already generic over any subcollection (its own comment already names weeks, items, meals and activity), so meals already get member-only read/write. Added an explicit kitchens/{kitchenId}/meals/{mealId} describe block to firestore.rules.test.ts (allow a member, deny a non-member) to make that coverage explicit per AC3's wording, rather than adding a redundant specific rule.

Cross-layer note: packages/ports/src/test-support.ts needed one more export (syncStoreMealContract, added from TASK-1.21.2's contract.ts) for providers to reach the meal contract suite through the public @grocs/ports/testing barrel - outside my providers-layer write scope, flagged to and resolved by the team lead.

Verified: pnpm exec vitest run --project unit packages/providers-memory packages/providers-firebase - 3 files, 37 tests pass. Full pnpm test (unit+ui+app+tools): 120 files, 1601 tests, 0 failed. pnpm check: only remaining findings are TASK-1.21.3's missing command scenario tests (add-meal/edit-meal/move-meal/remove-meal), outside this task. pnpm typecheck: only remaining errors are in packages/application/src/commands/add-item.scenario.test.ts (TASK-1.21.3's layer, partial SyncStore test doubles missing the new meal methods) - providers' own typecheck is clean, which was this task's job per the ports handoff. Emulator tests run directly against the already-running shared emulators (FIRESTORE_EMULATOR_HOST=127.0.0.1:8080, FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099, GCLOUD_PROJECT=demo-grocs, since another agent's session held the ports pnpm test:emulator's own emulators:exec would have grabbed): 8 files, 89 tests pass, including the new meal rules allow/deny tests and the Firestore meal contract's concurrent-write merge case.

Modified files: packages/providers-memory/src/memory-sync-store.ts(+test), packages/providers-firebase/src/firestore-sync-store.ts(+emulator test), firebase/firestore.rules.test.ts. firebase/firestore.rules itself is unchanged.

Left acceptance criteria and status change to review per instructions.

Addressed reviewer-providers' two findings: (1) corrected modified_files metadata to the five files actually touched (firestore-sync-store.ts, firestore-sync-store.emulator.test.ts, memory-sync-store.ts, memory-sync-store.test.ts, firestore.rules.test.ts) - firebase/firestore.rules itself was never touched and is removed from the list. (2) extended FirestoreSyncStore's class doc comment to name meals alongside items (path, shape-translation, and the transaction/offline caveat now cover both). No logic changes. Re-verified: pnpm exec vitest run --project unit packages/providers-memory packages/providers-firebase - 3 files, 39 tests pass. pnpm typecheck's only remaining error is in apps/mobile/src/screens/AddMealScreen.tsx (app/UI layer, TASK-1.21.5/.6 territory), unrelated to this task's layer.
<!-- SECTION:NOTES:END -->
