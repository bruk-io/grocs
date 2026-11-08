---
id: TASK-69
title: >-
  Follow-ups from TASK-56's review: silent kitchen-info failure on Household,
  over-broad invite retry
status: Done
assignee: []
created_date: '2026-11-06 23:41'
updated_date: '2026-11-08 20:26'
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
- [x] #1 Household shows a failed state when the kitchen's details cannot be read
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

## Work Completed (2026-11-08)

Added two route tests to apps/mobile/src/routes/screens.route.test.tsx to exercise the failed kitchen info path:
1. Test where getKitchenInfo rejects with an error - verifies error is handled
2. Test where getKitchenInfo resolves null - verifies null result is handled

Both tests verify that HouseholdScreen displays the error message: 'Could not check your kitchen: check your connection and try again'

Test Results:
- 1 test file passed
- 38 tests passed total (added 2 new tests)
- All 16 checks passed
- Typecheck passed with no errors
- Pre-commit hooks passed

Commit: 9e7116f - TASK-69: Add route tests for failed kitchen info state on Household

The tests exercise the real HouseholdScreen through the route, not just the template story. They verify that when getKitchenInfo fails (either by rejection or null resolution), the screen properly displays the failed state message through the HouseholdTemplate component.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(817 earlier lines omitted)
```text
│  3.73 kB │ gzip:   1.49 kB
│  storybook-static/assets/KitchenSetupTemplate.stories-DNMss1pw.js
│  4.34 kB │ gzip:   1.73 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BhqMxZMn.js
│  4.45 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Btl_3CFU.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/ItemRow-DvUMp8hC.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/PreferencesTemplate.stories-D5Odmrfs.js
│  5.30 kB │ gzip:   2.04 kB
│  storybook-static/assets/TextField-BnPWFEqF.js
│  5.35 kB │ gzip:   2.03 kB
│  storybook-static/assets/MealFormTemplate.stories-hbL71utF.js
│  6.26 kB │ gzip:   2.11 kB
│  storybook-static/assets/Button-BoEyW2D8.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-B6FC8Y0H.js
│  9.46 kB │ gzip:   3.16 kB
│  storybook-static/assets/Mascot-9qzfYchL.js
│  12.29 kB │ gzip:   4.47 kB
│  storybook-static/assets/icons-D9-RnOgP.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-ksyHI9MX.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-Bk-jiIm0.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-C68uENE-.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-COUQCjPE.js
│  1,361.35 kB │ gzip: 392.25 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.63s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/agent-abf8904e06b3e0799/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 458 story views checked (axe, 44 x 44, images not compared)
```

Closed (philosophy:reviewer, 2026-11-08). Criterion 1 met. The full check exited 0, including the emulator suite; visual images were not compared on darwin (axe and 44 x 44 ran). The two route tests go through the real /household route, KitchenGate, HouseholdScreen, composeApp and getKitchenInfo. vi.spyOn is effective: instrumentPort's Proxy reads the method from the fake at each call, so a spy installed after composeApp is seen, and getKitchen is used by getKitchenInfo only, so the gate is unaffected. By reading, the tests would fail if the screen stopped handling the failure: HouseholdScreen is the only producer of the failed invite, without it the screen stays on loading or shows the invite card, and the asserted line is absent. Not proved by mutation: an in-memory mutation run was denied by the reviewer's write guard and was not attempted another way. Findings, none filed: (low) the spy is cast with 'as any' and the beforeEach/afterEach restore is needless because each test builds its own gateway; cleanup only. (low) null is handled twice in the screen (got ?? 'failed' and kitchen === null), so removing either one alone would not fail the null test, with no change in behaviour. (accepted) blank title and member list on failure, accepted by Bruk until TASK-71. (info) no retry control on the failed line.
<!-- SECTION:NOTES:END -->
