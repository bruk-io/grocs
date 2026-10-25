---
id: TASK-1.21.4
title: >-
  Providers: Firestore and memory SyncStore implement meal methods;
  firestore.rules
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
labels:
  - layer-providers
  - size-3
dependencies:
  - TASK-1.21.2
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
