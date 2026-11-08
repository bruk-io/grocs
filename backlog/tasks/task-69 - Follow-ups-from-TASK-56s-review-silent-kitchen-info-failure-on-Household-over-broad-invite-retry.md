---
id: TASK-69
title: >-
  Follow-ups from TASK-56's review: silent kitchen-info failure on Household,
  over-broad invite retry
status: To Do
assignee: []
created_date: '2026-11-06 23:41'
updated_date: '2026-11-08 19:38'
labels:
  - size-1
  - app
  - providers
  - finish-moved
  - layer-app
dependencies: []
modified_files:
  - apps/mobile/src/routes/screens.route.test.tsx
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the reviewer's close of TASK-56 (c67d233). (1) HouseholdScreen hides a failed or empty getKitchenInfo: the member list stays empty, with no error, while the invite may still load. It should show the failed state the invite already has. (2) KitchenStore.inviteForKitchen (packages/providers-server/src/kitchen-store.ts) retries any error but NotAMemberError up to 5 times; only a new code colliding with an existing one (create() failing on an existing document) needs a retry, so real failures are slowed for nothing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Household shows a failed state when the kitchen's details cannot be read
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In apps/mobile/src/routes/screens.route.test.tsx, inside the Household describe, add a test where getKitchenInfo rejects and assert 'Could not check your kitchen: check your connection and try again' appears. Reuse how that file already fakes the app for Household.
2. Add a second test where getKitchenInfo resolves null and assert the same line.
3. Run the app project's route tests and pnpm check.
4. If the screen does not show the line in either case, fix apps/mobile/src/screens/HouseholdScreen.tsx so it does, and nothing else.

### Risks
- The failure must come through the real screen and app facade, not by rendering the Failed story.

### Proof
- The two route tests, run through a real route.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(44 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
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

 Test Files  157 passed (157)
      Tests  2110 passed (2110)
   Start at  12:57:54
   Duration  17.33s (transform 112.88s, setup 14.56s, import 262.36s, tests 66.27s, environment 42.53s)

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

Review (philosophy:reviewer, 2026-11-08): left open; no criteria ticked. #2 is obsolete, not met: TASK-78.1 (36694c2) removed inviteForKitchen and its code-collision retry. KitchenStore has no retry loop now; its only re-running is Firestore runTransaction's own contention handling. #2 cannot be ticked as written, and needs its owner to withdraw or reword it. #1 has a gap: HouseholdScreen maps a rejected or null getKitchenInfo to the invite's failed state, by reading the code, but no test exercises that path. The template test renders the Failed story only, and that story passes kitchenName 'Our kitchen' and a member, which the screen does not do on failure. No route test in screens.route.test.tsx makes the read fail. On failure the screen gives an empty title and an empty member list; the only failure signal is the line 'Could not check your kitchen: check your connection and try again', with no retry control. Check: record-check full exited 1 only at the emulator step because ports 9099, 8080 and 4400 were held by already running processes; checks, typecheck and 2110 unit/ui/app/tools tests passed; the emulator suite did not run. To close: add a route test that fails getKitchenInfo and asserts the failed line, decide whether the empty title and list are acceptable, and withdraw or reword #2.

Finish moved 2026-11-08: removed 'inviteForKitchen retries only a code collision'. TASK-78.1 (36694c2) deleted that function and KitchenStore has no retry loop, per this task's review. Criterion 1 remains and still needs a route test that makes getKitchenInfo reject and return null.
<!-- SECTION:NOTES:END -->
