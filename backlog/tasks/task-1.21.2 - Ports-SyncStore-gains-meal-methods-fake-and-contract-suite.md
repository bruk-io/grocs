---
id: TASK-1.21.2
title: 'Ports: SyncStore gains meal methods, fake and contract suite'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:13'
labels:
  - layer-ports
  - size-2
dependencies:
  - TASK-1.21.1
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extends the existing SyncStore port (the kitchen's shared data) with meal methods, the same way it already holds item methods - not a new gateway, since meals and items share identical sync/merge/offline semantics. Depends on the core meal model landing first (the frozen contract).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/ports/src/sync-store/port.ts's SyncStore gains mergeMeal(kitchenId, meal), getMeals(kitchenId, weekId), watchMeals(kitchenId, weekId, onMeals, onError), matching the shape of the existing item methods
- [ ] #2 packages/ports/src/sync-store/fake.ts implements the new methods in-memory
- [ ] #3 packages/ports/src/sync-store/contract.ts gains tests for create, rename, relink, move between weeks, remove (tombstone), and a concurrent-edit merge case, run against the fake
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. port.ts: extend SyncStore with mergeMeal(kitchenId, meal: Meal): Promise<void>, getMeals(kitchenId, weekId): Promise<readonly Meal[]>, watchMeals(kitchenId, weekId, onMeals, onError?): Unsubscribe - mirroring the item methods exactly, per R26/R28/R29 and ports-describe-intent.
2. fake.ts: InMemorySyncStore gains a #meals map and #mealWatchers set, mirroring #items/#watchers; mergeMeal uses mergeMeal from @grocs/core; #select filters by meal.weekId.value === weekId (weekId is Stamped on Meal, unlike Item's plain weekId).
3. contract.ts: add a meal fixture helper using createMeal (mirroring item()), and add tests for create, rename, relink, move between weeks, remove (tombstone), a concurrent-edit merge case, and one watchMeals test (R48 requires every port method have contract coverage, and watchMeals isn't named in the AC list but needs it).
4. Run pnpm exec vitest run --project unit packages/ports, then full pnpm test, pnpm check, pnpm typecheck before done.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented port.ts's mergeMeal/getMeals/watchMeals (mirroring the item methods exactly), fake.ts's InMemorySyncStore gains #meals/#mealWatchers (mirroring #items/#watchers, filtering on meal.weekId.value since weekId is Stamped on Meal unlike Item's plain weekId), and contract.ts gains a separate syncStoreMealContract export covering create, rename, relink, move between weeks, remove (tombstone), a concurrent-edit merge case, and a watchMeals case (R48 requires every port method be covered; watchMeals wasn't named in the AC list but needs a test). fake.test.ts calls both syncStoreContract and syncStoreMealContract.

Kept meal coverage in its own exported function rather than folding it into syncStoreContract: the provider packages (packages/providers-memory, packages/providers-firebase) pass their own stores into syncStoreContract today and don't implement the new meal methods yet (that's TASK-1.21.4), so a single merged suite would throw TypeErrors at runtime in their test files the moment it called store.mergeMeal on a provider that doesn't have it. Verified this empirically: before the split, pnpm test failed with 7 runtime TypeErrors in packages/providers-memory/src/memory-sync-store.test.ts (store.mergeMeal is not a function). After the split, pnpm test (unit+ui+app+tools) is 120 files / 1591 passed, 0 failed, and pnpm check is 14/14 green.

pnpm typecheck is NOT green and cannot be made green from within this task's layer: SyncStore now declares mergeMeal/getMeals/watchMeals as required members, so FirestoreSyncStore and MemorySyncStore (packages/providers-firebase, packages/providers-memory) now fail TS2420 (incomplete interface implementation), and every call site that constructs a partial SyncStore test double (packages/application/src/commands/add-item.scenario.test.ts) or composes the real one (apps/mobile/src/composition/compose-firebase.ts, apps/mobile/src/demo/compose-demo.ts) fails TS2739. This is a structural consequence of extending a shared interface before its implementers exist, not a bug in the ports layer - fixing it means writing in providers-memory/providers-firebase/application/apps, which is TASK-1.21.4/.3/.6's work and outside this task's and this agent's layer. Flagging for the orchestrator rather than guessing: either land 1.21.2 and 1.21.4 together, or accept typecheck red on the ports commit alone until 1.21.4 lands. Did not make the new methods optional (mergeMeal?) to paper over this - that would be a backwards-compat shim on a contract meant to be used uniformly, and would push undefined-handling into every caller.

pnpm exec vitest run --project unit packages/ports/src/sync-store: 17 tests pass (10 item + 7 meal).

Re-exported syncStoreMealContract from packages/ports/src/test-support.ts (the public @grocs/ports/testing barrel), alongside the existing syncStoreContract export, at the lead's request so TASK-1.21.4's provider tests can import it. pnpm exec vitest run --project unit packages/ports: 49 tests pass, unchanged. Still holding uncommitted, waiting on providers/application to land before the combined commit.

Per reviewer-providers' finding (via the lead): added the two cases syncStoreMealContract was missing relative to the item contract - 'merging the same copy of a meal twice changes nothing' (mergeMeal's own doc comment promises this) and 'does not mix the meals of two kitchens' (otherKitchenId was already threaded into the subject but never exercised for meals). pnpm exec vitest run --project unit packages/ports/src/sync-store: 19 tests pass (was 17). Still holding uncommitted, waiting on providers' two fixes to land before the combined commit.
<!-- SECTION:NOTES:END -->
