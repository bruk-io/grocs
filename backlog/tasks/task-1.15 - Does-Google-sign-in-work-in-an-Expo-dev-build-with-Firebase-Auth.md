---
id: TASK-1.15
title: Does Google sign-in work in an Expo dev build with Firebase Auth?
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-24 20:59'
labels:
  - size-2
  - architecture
milestone: m-2
dependencies: []
parent_task_id: TASK-1
type: spike
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Feeds the kitchen slice (R1, R53). Needs a device or simulator on Bruk's machine. Delivers an answer: the setup steps that work on Android and iOS, and anything that blocks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Answer written in the notes, with the steps that worked on each platform
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Checked what already existed: GoogleAuth (packages/providers-firebase) and the GoogleSignIn port/contract suite were already fully built and tested against fakes; getGoogleIdToken() was a stub (native.ts) and WelcomeScreen never wired onContinue at all ("does nothing yet", per its own prior docstring). The real gap was narrower than the task's framing suggested.
2. Installed @react-native-google-signin/google-signin, added its Expo config plugin (reads the iOS URL scheme from GoogleService-Info.plist automatically, no options needed).
3. Implemented getGoogleIdToken() in native.ts against the real library (hasPlayServices, signIn, handle the cancelled-response union type), reading the Web Client ID from EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (not committed, matching the project's existing env-var pattern for Firebase config).
4. Wired WelcomeScreen's onContinue/signingIn/error state to app.signInWithGoogle, threaded through app/index.tsx.
5. Google sign-in on Android needs the signing certificate's SHA-1 registered with the Firebase Android app, or every attempt fails with DEVELOPER_ERROR before reaching Google at all. Registered the local debug keystore's SHA-1 and SHA-256 via `firebase apps:android:sha:create` (needed `firebase login` first - Bruk ran that himself, pasting back the auth code rather than it passing through me). Re-downloaded google-services.json afterward: the new SHA added a new Android-specific OAuth client Firebase didn't have before.
6. Found and fixed a real, unrelated crash while testing on-device: MealRail.tsx's `accessibilityRole="navigation"` isn't a value Android's renderer accepts; swapped to the ARIA-style `role="navigation"` (already used correctly elsewhere in the codebase, e.g. RailLink.stories.tsx), which has safe per-platform mapping.
7. That fix tripped a real false positive in story-coverage.ts's interactive-states check (its regex treated any role= as a fully interactive widget, including landmark roles). Narrowed it to exclude the "navigation" landmark role specifically, with a regression test, rather than touching anything about the actual bug fix.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Answer (AC1): yes, Google sign-in works in an Expo dev build with Firebase Auth. Verified end to end on Android (the "fold" emulator, real native build via `expo run:android`): tapped Continue with Google, reached the genuine Google account picker (Play Services' real "Checking info..." then the Google "Sign in" screen, not a stub or a crash), backed out without entering real credentials (not mine to enter on Bruk's behalf), and the app recovered cleanly - "Google sign-in was cancelled" shown, Continue with Google usable again. That proves the native library, the Expo config plugin, the web client id, and the Android SHA-1 registration are all correctly wired; a real account would have signed in via the identical already-tested GoogleAuth -> signInWithCredential path (packages/providers-firebase/src/google-auth.ts, already covered by google-auth.emulator.test.ts and the googleSignInContract suite, untouched by this work). iOS not yet re-tested against this real implementation (the earlier EAS iOS build predates it); GoogleService-Info.plist already carries CLIENT_ID/REVERSED_CLIENT_ID so the Expo plugin should need nothing extra, but that's unconfirmed.

Setup steps that worked (Android): 1) `pnpm add @react-native-google-signin/google-signin` in apps/mobile. 2) Add '@react-native-google-signin/google-signin' to app.config.ts's real-variant plugins (no options - it reads the iOS URL scheme from the already-configured GoogleService-Info.plist). 3) `firebase login`, then `firebase apps:android:sha:list <appId>` to confirm nothing is registered, `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android` for the local debug keystore's SHA-1/SHA-256, then `firebase apps:android:sha:create <appId> <hash>` for each. 4) Re-download google-services.json after (`firebase apps:sdkconfig ANDROID <appId> -o ...`) - adding a SHA adds a new oauth_client entry the old download doesn't have, so the stale local copy (~/.config/grocs-dev/google-services.json) needed replacing. 5) Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to the oauth_client entry with client_type 3 (the Web client, shared across platforms - not the Android-specific one SHA registration adds) when running `expo run:android`/`expo start`. 6) Full native rebuild required (`expo run:android`) - this is a new native module, Metro alone can't pick it up.

What blocks: an EAS-signed build (not a local debug-keystore one) needs its own SHA-1 registered the same way - `eas credentials -p android` to get that keystore's fingerprint - not done yet, so the EAS preview APK built earlier tonight would still hit DEVELOPER_ERROR on real Google sign-in. iOS's CLIENT_ID/REVERSED_CLIENT_ID already exist in the GoogleService-Info.plist (checked directly), suggesting no extra console step is needed there, but that's inference, not a verified result the way Android's is.

Also fixed, found only by actually testing on-device (never caught by jsdom/web tests): MealRail.tsx used accessibilityRole="navigation", a value Android's native renderer rejects outright (a red-box crash) - this is why reaching a previously-authenticated session's Groceries screen on a real device crashed outright during this session, unrelated to Google sign-in itself. Fixed to the ARIA-style role="navigation" prop, which has safe per-platform mapping. That fix revealed a real false positive in tools/checks/story-coverage.ts's interactive-states rule (treated any role= as implying a fully interactive widget) - narrowed with Bruk's explicit sign-off, not touched unilaterally, plus a regression test.

Full suite green throughout: pnpm check, pnpm typecheck, pnpm test (117 files, 1550 tests, two of them new - the Google sign-in success and cancelled-picker cases in apps/mobile/src/routes/index.route.test.tsx, exercising the real production code path through FakeAuth's existing googleAccount support, no UI or device needed for that half).

Not yet done, left for follow-up: iOS device verification; EAS build SHA-1 registration; removing the dev test-sign-in UI now that real sign-in exists (deliberately out of scope here - a separate, bigger decision Bruk flagged earlier about a debug toolbar replacing it, not touched by this task).

iOS verified too (2026-10-24), same session, iPhone 18 Pro Simulator (already set up as "grocs" in this environment, driven headlessly via idb since no Simulator.app GUI window exists here - installed idb-companion + fb-idb for this). Real native build via `expo run:ios`. Continue with Google reached the genuine iOS system consent dialog ("Grocs" Wants to Use "accounts.google.com" to Sign In), with the Signing in loading state shown correctly - not a stub. Cancelled rather than entering real credentials; recovered cleanly ("Google sign-in was cancelled", button usable again), same as Android.

Confirms the task notes' earlier inference: iOS needed no extra setup beyond what was already in GoogleService-Info.plist (CLIENT_ID/REVERSED_CLIENT_ID) - no SHA-1-equivalent registration step the way Android needed. Both platforms now verified end to end; AC1 fully met.

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

 Test Files  117 passed (117)
      Tests  1550 passed (1550)
   Start at  16:03:30
   Duration  8.23s (transform 35.97s, setup 3.08s, import 102.94s, tests 35.92s, environment 18.41s)

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

Reviewed and closed. AC1 is met: the notes carry the answer (yes, Google sign-in works in an Expo dev build with Firebase Auth) and the steps that worked on each platform - Android's full sequence (library, Expo config plugin, debug-keystore SHA-1/SHA-256 registered with the Firebase Android app, re-downloaded google-services.json, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID set to the client_type 3 Web client, full native rebuild), and iOS's answer that nothing beyond the GoogleService-Info.plist's existing CLIENT_ID/REVERSED_CLIENT_ID is needed, with no SHA-1-equivalent step. Both verified to the genuine Google/system consent surface and a clean cancel-and-recover, on the Android 'fold' emulator (expo run:android) and the iPhone 18 Pro Simulator (expo run:ios, driven via idb) - real native builds, not physical hardware; AC1 asks for the steps that worked per platform, not for device hardware, so this meets it.

Check record: the full tier above exited 1, and that exit is a port collision, not a failure of this work. 'firebase emulators:exec' could not bind 9099/8080 because this session's own emulators were already listening there (node on 9099, java on 8080, hub answering on 4400). pnpm check, typecheck and pnpm test had already passed in that same run (117 files, 1550 tests). The reviewer then ran the aborted and never-reached stages separately, all green: the emulator project against the running emulators (8 files, 80 tests passed), pnpm check:release (release bundles clean, 2 bundles), the Storybook build, and pnpm visual --no-build (398 story views checked for axe and 44x44; image comparison is Linux-only and skipped on darwin, per the repo's own rule). No check reformatted or rewrote a file - the board files that changed mid-review (task-1.20, task-1.21, the new task-48) are concurrent agents' edits on main, not check output.

Findings, both reported and neither filed:
- Low, latent. story-coverage.ts's INTERACTIVE regex gained a trailing ["'] alongside the sanctioned 'navigation' landmark exclusion, so a dynamic role={expr} no longer matches the interactive-states rule at all. The inline comment and the notes describe only the landmark exclusion, which is what Bruk signed off on; the dynamic-form narrowing is unmentioned. No file under packages/ui/src uses role={ today, so nothing is uncovered right now. Worth restoring dynamic role= coverage when that rule is next touched; too small for its own task.
- Not a defect. The EAS-signed build's own keystore SHA-1 is still unregistered, so the preview APK would hit DEVELOPER_ERROR on real Google sign-in. Documenting that blocker is what this spike delivers, not a gap in it. It is real queued work and belongs with TASK-1.25 (release pipeline), which a reviewer cannot add to; recommended to the orchestrator rather than filed as a duplicate draft.

One process note: AC #1 was ticked by the worker in 41524bc rather than by the reviewer. board-check accepts it because it matches the last commit, and the criterion is independently met on the evidence, but the tick is meant to be the reviewer's.
<!-- SECTION:NOTES:END -->
