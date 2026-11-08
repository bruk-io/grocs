---
id: TASK-81
title: >-
  Kitchen store emulator tests break on a second run against long-lived
  emulators
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 05:07'
updated_date: '2026-11-08 18:07'
labels:
  - size-1
  - providers
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
packages/providers-server/src/kitchen-store.emulator.test.ts uses a fixed kitchen id, so a second run of the emulator project against one running pnpm emulators instance fails on the first run's documents. Same shape as TASK-74.4.10 (fixed for the recipe cache tests with a run-unique id). Found by philosophy:reviewer closing TASK-74.4.10 on 2026-11-07; predates TASK-74.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 kitchen-store.emulator.test.ts uses ids unique to the run, and running the emulator project twice against one long-lived emulator instance passes both times
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm exec firebase emulators:exec --only firestore,auth --project demo-grocs /private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/52850201-1584-4979-8b13-ca0cc6779c1a/scratchpad/kitchen-twice.sh` exited 0

(7 earlier lines omitted)
```text
 Test Files  1 passed (1)
      Tests  23 passed (23)
== run 2
 Test Files  1 passed (1)
      Tests  23 passed (23)
== run 3
 Test Files  1 passed (1)
      Tests  23 passed (23)
✔  Script exited successfully (code 0)
i  emulators: Shutting down emulators.
i  firestore: Stopping Firestore Emulator
i  auth: Stopping Authentication Emulator
i  hub: Stopping emulator hub
i  logging: Stopping Logging Emulator
```

No repro: the bug no longer exists to reproduce. Commit 36694c2 (TASK-78.1) gave this file per-run ids and uids (newId, person()) before anyone worked this task. The check above runs the file three times against one long-lived emulator instance. TASK-50, the same cross-run problem, was archived as a duplicate.

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
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
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

 Test Files  157 passed (157)
      Tests  2110 passed (2110)
   Start at  12:57:46
   Duration  18.70s (transform 141.90s, setup 11.17s, import 299.19s, tests 86.98s, environment 51.27s)

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

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(525 earlier lines omitted)
```text
i  functions: Finished "us-central1-importRecipe" in 8.05625ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
>  {"error":"invalid-url","severity":"INFO","message":"importRecipe failed"}
i  functions: Finished "us-central1-importRecipe" in 0.935375ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"MISSING"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 0.879833ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"MISSING"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 0.903917ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 0.875875ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
>  {"error":"invalid-url","severity":"INFO","message":"importRecipe failed"}
i  functions: Finished "us-central1-importRecipe" in 0.814958ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 3.683875ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"MISSING"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 0.863333ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |emulator| packages/providers-firebase/src/kitchen-gateway.emulator.test.ts > KitchenGateway contract > a cancelled invite is no longer offered and cannot be used
 FAIL  |emulator| packages/providers-firebase/src/kitchen-gateway.emulator.test.ts > KitchenGateway contract > refuses an invite once both members are in, so a third person never gets in (R3)
FirebaseError: not a member of this kitchen [403]
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯


 Test Files  1 failed | 10 passed (11)
      Tests  2 failed | 142 passed (144)
   Start at  13:00:04
   Duration  19.92s (transform 236ms, setup 0ms, import 2.57s, tests 16.58s, environment 1ms)

⚠  Script exited unsuccessfully (code 1)
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 0.715792ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
>  {"error":"invalid-url","severity":"INFO","message":"importRecipe failed"}
i  functions: Finished "us-central1-importRecipe" in 0.601458ms
i  functions: Beginning execution of "us-central1-importRecipe"
>  {"verifications":{"app":"MISSING","auth":"VALID"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"DEBUG","message":"Callable request verification passed"}
i  functions: Finished "us-central1-importRecipe" in 3.782625ms
i  emulators: Shutting down emulators.
i  functions: Stopping Functions Emulator
i  firestore: Stopping Firestore Emulator
i  auth: Stopping Authentication Emulator
i  eventarc: Stopping Eventarc Emulator
i  tasks: Stopping Cloud Tasks Emulator
i  hub: Stopping emulator hub
i  logging: Stopping Logging Emulator

Error: Script "vitest run --project emulator" exited with code 1
[ELIFECYCLE] Command failed with exit code 1.
```

Closed by philosophy:reviewer. Criterion 1 met. Ids: the file's newId() and person() give per-run ids, uids and emails since 36694c2; the remaining fixed addresses (partner@example.com, x@example.com) are invite targets no caller holds, so they cannot match. Runs: the worker's check ran this file three times on one instance with no data wipe between runs; the reviewer ran the whole emulator project twice on one instance (11 files, 144 tests, both passed) and six more times on another (all passed). Those eight runs were not recorded through record-check; this note is their record. The project runs alone are weaker proof because firestore.rules.test.ts clears Firestore during each run; the single-file runs cover that. TASK-50: criterion 1 (fixed stranger uid) is covered, in both the Admin SDK file and the Functions file. Its criterion 2 (determinism) is NOT shown, despite the archive note calling it a duplicate. Full check: exited 1 twice. First, ports held by another emulators:exec run. Second, 2 of 144 tests failed in packages/providers-firebase/src/kitchen-gateway.emulator.test.ts with a 403 not a member, on a fresh instance, a different file and path from this criterion; cause unknown. check:release, build-storybook and visual did not run and are unverified in this review; this task changed no code. Finding: the intermittent 403, filed as a draft, which also carries TASK-50 criterion 2. Worker's note gap: its check ran one file, not the project the criterion names; filled by the runs above.
<!-- SECTION:NOTES:END -->
