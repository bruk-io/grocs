---
id: TASK-1.21.4
title: >-
  Providers: Firestore and memory SyncStore implement meal methods;
  firestore.rules
status: Done
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 22:48'
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
- [x] #1 FirestoreSyncStore implements mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId}, same transaction-based merge-on-write pattern as mergeItem
- [x] #2 MemorySyncStore implements the same methods in-memory, for the demo build and app-layer tests
- [x] #3 firebase/firestore.rules gains kitchens/{kitchenId}/meals/{mealId} rules mirroring items' member-only read/write, with allow/deny tests added to firestore.rules.test.ts
- [x] #4 Emulator tests cover the real Cloud Firestore round trip for every meal method, including a concurrent-write merge test
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
   Start at  18:36:39
   Duration  8.32s (transform 38.07s, setup 3.33s, import 108.10s, tests 36.47s, environment 18.99s)

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

Closed. All four criteria met; verified independently by reading the committed code (c4db885) rather than trusting the notes.

AC1: FirestoreSyncStore.mergeMeal/getMeals/watchMeals at kitchens/{kitchenId}/meals/{mealId} (firestore-sync-store.ts:62-106) mirror mergeItem/getItems/watchItems line for line, including the runTransaction read-merge-write. The one divergence - the week query reads 'weekId.v' because Meal's stored weekId is a Stamped field, unlike Item's plain string - is correct and carries a comment saying why (line 103).
AC2: MemorySyncStore gains #meals/#mealWatchers mirroring #items/#itemWatchers exactly, filtering on meal.weekId.value (memory-sync-store.ts:53-104).
AC3: met by interpretation, not by a diff to firebase/firestore.rules. Read the rules myself: the existing match /kitchens/{kitchenId}/{collection}/{document=**} grants member-only read/write to every per-kitchen subcollection, meals included, and its comment already names meals. A meals-specific match would be dead duplication. The allow/deny tests the criterion asks for are there and real (firestore.rules.test.ts:107-119, a member succeeds, a non-member fails on both read and write), and they pass against the emulator. Recorded rather than filed: the criterion's wording ('firestore.rules gains ... rules') asks for a file change the correct implementation does not need, so it is a wording problem for whoever writes the next rules criterion, not a defect in this work.
AC4: the Firestore emulator test calls syncStoreMealContract (firestore-sync-store.emulator.test.ts:30), which covers create, idempotence, cross-kitchen isolation, rename, relink, move between weeks, tombstone, the concurrent different-field merge (contract.ts:227) and the watcher - every meal method against real Cloud Firestore.

Checks: pnpm check 14 checks pass; pnpm typecheck clean (the AddMealScreen.tsx error the worker saw is gone); unit tier 125 files / 1639 tests pass. The full tier's 'pnpm test:emulator' step fails in this session only because the shared emulators already hold ports 8080/9099, so emulators:exec cannot start its own - not a code finding. Run directly against the running emulators it is 8 files / 91 tests, three consecutive clean runs. One first-run failure in the kitchen-gateway contract (joinKitchen member count) did not reproduce and is in another layer with a cold functions emulator as the likely cause; mentioned here only so it is not lost.

No findings filed as drafts.
<!-- SECTION:NOTES:END -->
