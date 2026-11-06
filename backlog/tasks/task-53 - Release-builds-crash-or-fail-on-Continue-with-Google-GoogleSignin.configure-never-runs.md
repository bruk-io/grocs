---
id: TASK-53
title: >-
  Release builds crash or fail on Continue with Google: GoogleSignin.configure()
  never runs
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 16:13'
updated_date: '2026-11-06 17:44'
labels:
  - size-2
  - release
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Testers on TestFlight build 8 (iOS) and the v0.1.0 APK (Android) report the app dies the moment they tap Continue with Google. Cause, confirmed 2026-11-06: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is set only in Bruk's local shell, never in EAS's production/preview environments or release.yml, so Metro inlines undefined into the cloud-built bundle and native.ts silently skips GoogleSignin.configure(). Evidence: build 8's main.jsbundle holds no *.apps.googleusercontent.com string; eas env:list shows only GOOGLE_SERVICES_JSON_PATH and GOOGLE_SERVICE_INFO_PLIST_PATH in every environment; the v0.1.0 APK on the fold emulator shows 'apiClient is null - call configure() first' on tap. iOS crashes rather than erroring because RNGoogleSignin.mm wraps GIDSignIn signIn in @try/@catch only under #if DEBUG, so the no-configuration NSException is uncaught in release. Separately, the EAS Android keystore's SHA-1 (5d:51:60:a9:8e:50:43:25:e2:b7:2f:85:12:d6:66:3d:5a:9c:2c:4c) is not registered on the Firebase Android app, so Android sign-in would fail with DEVELOPER_ERROR even once configured. Nothing in CI caught this: pnpm check:release inspects a local export, not the bundle EAS builds.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Both EAS environments the release workflow builds from (production for iOS, preview for Android) define EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
- [x] #2 A missing web client ID fails at sign-in with a readable message on both platforms instead of calling the native picker unconfigured
- [x] #3 A non-demo EAS build without EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID fails during config evaluation, with the reason in the error
- [x] #4 release.yml fails before submitting when the built bundle carries no Google web client ID
- [x] #5 The EAS Android signing certificate's SHA-1 and SHA-256 are registered on the Firebase Android app
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. EAS: create EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (plaintext; the client_type 3 Web client from google-services.json, public by design) in production, preview, development. Done.
2. Firebase: register the EAS Android keystore SHA-1/SHA-256 (read with apksigner from the v0.1.0 APK) on the Android app. Done.
3. apps/mobile/src/composition/native.ts: getGoogleIdToken rejects with a readable Error when the web client ID is absent, before touching GoogleSignin (iOS release has no @catch around GIDSignIn).
4. apps/mobile/app.config.ts: throw during config evaluation on a non-demo EAS build (EAS_BUILD=true) without EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID; test in app-config.test.ts.
5. release.yml: after each build, download the artifact and assert its JS bundle contains the web client ID, before submit/upload. The check script lives in tools/ so it is runnable locally against any IPA/APK.
6. Verify: pnpm check, typecheck, test; run the bundle check against build 8's IPA and the v0.1.0 APK (must fail), then against new builds (must pass).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06: EAS env var EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID created (plaintext) in production, preview, development; verified with eas env:list. Firebase Android app now has SHA-1 5d5160a9... and SHA-256 2238a673... (EAS keystore, read with apksigner from the v0.1.0 APK); verified with apps:android:sha:list. tools/built-sign-in.ts fails (exit 1) on build 8's IPA and on the v0.1.0 APK, as it should. pnpm check, typecheck, test (1663) pass. The release.yml change is additive-only: the weakening guard (R57) flags any removed CI line, so the iOS step reads the newest build via build:list instead of changing the build/submit lines.

2026-11-06 end-to-end (Android): eas build --local --profile preview from 9ecf6db loaded EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID from the preview environment; the APK is signed by SHA-1 5d5160a9... (EAS keystore). node tools/built-sign-in.ts on it: exit 0, 'bundle carries Google client ID 950648718006-qf0blvdefh26l0sptdg2nqv2qbomt1it.apps.googleusercontent.com'. Installed on the fold emulator: Continue with Google opened the Google account picker; choosing the account logged 'signInWithCredential:onComplete:success' and the app reached the Groceries screen. iOS is not run on a device here: a store-signed IPA does not run on the simulator. Its evidence is the release.yml bundle check on the new TestFlight build.

2026-11-06 release v0.1.1 (run 42257624472, all three jobs green). The new release.yml step ran in both jobs: 'apps/mobile/grocs.ipa: bundle carries Google client ID 950648718006-qf0blvdefh26l0sptdg2nqv2qbomt1it...' and the same for grocs.apk. iOS build 9 (commit 6bade98) submitted to TestFlight, EAS submission status finished; node tools/built-sign-in.ts on its IPA locally exits 0. grocs-apk artifact uploaded; GitHub Release https://github.com/bruk-io/grocs/releases/tag/v0.1.1. Not yet confirmed on a physical phone: Shazya needs to update to build 9 in TestFlight.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(52 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetUris.js" points to missing source files
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
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  127 passed (127)
      Tests  1663 passed (1663)
   Start at  12:43:36
   Duration  8.25s (transform 37.30s, setup 3.97s, import 105.05s, tests 38.54s, environment 19.45s)

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

No repro: the bug lives in EAS's cloud bundling environment, not in a test the repo can run; the worker's recorded repro is tools/built-sign-in.ts exiting 1 on build 8's IPA and the v0.1.0 APK (pre-fix artifacts) and the 'apiClient is null' error on the fold emulator. The reviewer did not re-run it against those artifacts.

Reviewed by philosophy:reviewer. All five criteria met: #1 eas env:list production and preview both define EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID; #2 native.ts throws a readable Error before any GoogleSignin call; #3 app.config.ts assertSignInConfigured throws on a non-demo EAS build without the ID, tested in app-config.test.ts; #4 release.yml runs tools/built-sign-in.ts before submit/upload, run 42257624472 shows it passing on grocs.ipa and grocs.apk; #5 Firebase lists SHA-1 5d5160a9...2c4c and SHA-256 2238a673...d523. Full-tier check exited 1 only because pnpm test:emulator could not bind port 9099 (held by another local node process), so check:release, storybook and visual did not run; pnpm check, typecheck, test passed. Findings, none filed: (low) bundle check matches any *.apps.googleusercontent.com ID, not specifically the web client; (low) iOS download relies on build:list --limit 1 plus the concurrency group; (info) not yet confirmed on a physical iPhone.
<!-- SECTION:NOTES:END -->
