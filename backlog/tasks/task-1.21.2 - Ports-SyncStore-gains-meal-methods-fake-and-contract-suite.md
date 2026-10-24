---
id: TASK-1.21.2
title: 'Ports: SyncStore gains meal methods, fake and contract suite'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:51'
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
- [x] #1 packages/ports/src/sync-store/port.ts's SyncStore gains mergeMeal(kitchenId, meal), getMeals(kitchenId, weekId), watchMeals(kitchenId, weekId, onMeals, onError), matching the shape of the existing item methods
- [x] #2 packages/ports/src/sync-store/fake.ts implements the new methods in-memory
- [x] #3 packages/ports/src/sync-store/contract.ts gains tests for create, rename, relink, move between weeks, remove (tombstone), and a concurrent-edit merge case, run against the fake
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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(52 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  125 passed (125)
      Tests  1639 passed (1639)
   Start at  18:36:26
   Duration  12.01s (transform 66.11s, setup 3.64s, import 164.21s, tests 52.59s, environment 28.63s)

$ firebase emulators:exec --only firestore,auth,functions --project demo-grocs 'vitest run --project emulator'
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-grocs", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
⚠  auth: Port 9099 is not open on 127.0.0.1, could not start Authentication Emulator.
⚠  auth: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "auth": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  firestore: Port 8080 is not open on 127.0.0.1, could not start Firestore Emulator.
⚠  firestore: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "firestore": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  logging: Logging Emulator unable to start on port 4500, starting on 4501 instead.
i  emulators: Shutting down emulators.

Error: Could not start Authentication Emulator, port taken.
[ELIFECYCLE] Command failed with exit code 1.
```

Review (close-work, reviewer): the failed check block recorded just above is an environment collision, not a code failure - `record-check --tier full` aborted at the emulator step because another agent's Firebase emulators already hold ports 8080/9099 (PIDs 52368/52439); nothing was wrong with the code and the emulators were not mine to kill.

Verified independently instead, on commit c4db885 (branch feat/meal-ports-providers-application, PR #9):
- AC1: packages/ports/src/sync-store/port.ts declares mergeMeal(kitchenId, meal), getMeals(kitchenId, weekId), watchMeals(kitchenId, weekId, onMeals, onError?) with the same shapes and doc-comment style as the item trio. Met.
- AC2: packages/ports/src/sync-store/fake.ts's InMemorySyncStore implements all three with #meals/#mealWatchers mirroring #items/#itemWatchers, selecting on meal.weekId.value. Met.
- AC3: packages/ports/src/sync-store/contract.ts exports syncStoreMealContract with all six named cases (create, rename, relink, move between weeks, remove/tombstone, concurrent-edit merge) plus idempotence, cross-kitchen isolation and watchMeals. Run against the fake from fake.test.ts. Met.
- pnpm test: 125 files / 1639 tests passed.
- pnpm exec vitest run --project emulator packages/providers-firebase/src/firestore-sync-store.emulator.test.ts against the already-running emulators: 23/23 passed (10 item contract, 9 meal contract, 4 stored-shape), so the extended contract holds against the real provider too.
- pnpm typecheck: clean. The typecheck-red situation described in the earlier notes is resolved now that providers and application landed in the same commit.
- pnpm check: 14/14 passed.
- The ports portion of the three-layer commit is confined to packages/ports/ (port.ts, fake.ts, contract.ts, fake.test.ts, test-support.ts) - no layer-boundary violation.
Checks ran on a tree with unrelated uncommitted UI and launch-guard edits; no ports, providers or application file is dirty, so the evidence holds for this task.

Two non-blocking parity gaps, recorded as findings rather than rework: syncStoreMealContract has no 'stops telling a watcher after it unsubscribes' case (the item suite does), and no store-level R20 'a late change made before the delete does not bring the meal back' case. Neither is named in the ACs and both are outside R48's one-test-per-method requirement; the R20 invariant itself is covered at length in packages/core/src/merge/meal-merge.test.ts.

Closed. All three acceptance criteria met and verified independently on commit c4db885: the SyncStore port carries mergeMeal/getMeals/watchMeals in the item methods' shape, InMemorySyncStore implements them, and syncStoreMealContract covers every case the ACs name plus idempotence, cross-kitchen isolation and watchMeals - green against the fake (pnpm test, 1639 tests) and against the real Firestore provider on the emulators (23/23 in firestore-sync-store.emulator.test.ts). pnpm typecheck and pnpm check (14/14) are clean, and the earlier typecheck-red note is resolved now that providers and application landed in the same commit. The ports changes stay inside packages/ports/.

Findings, neither blocking: syncStoreMealContract lacks an unsubscribe case and a store-level R20 late-change-after-delete case that the item suite has. Both are item-suite parity rather than AC or R48 requirements, and the R20 invariant is covered thoroughly in packages/core/src/merge/meal-merge.test.ts, so they are left as a parity note here rather than filed as a draft or sent back for rework.

Note for the record: a `record-check --tier full` run on this task aborted at the emulator step because another agent's emulators held ports 8080/9099. That failing block in the notes is an environment collision, not a code failure; the evidence above was gathered against the running emulators instead.
<!-- SECTION:NOTES:END -->
