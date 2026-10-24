---
id: TASK-1.15
title: Does Google sign-in work in an Expo dev build with Firebase Auth?
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-24 17:19'
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
<!-- SECTION:NOTES:END -->
