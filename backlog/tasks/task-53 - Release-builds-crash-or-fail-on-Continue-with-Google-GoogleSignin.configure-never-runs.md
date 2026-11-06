---
id: TASK-53
title: >-
  Release builds crash or fail on Continue with Google: GoogleSignin.configure()
  never runs
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 16:13'
updated_date: '2026-11-06 16:14'
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
- [ ] #1 Both EAS environments the release workflow builds from (production for iOS, preview for Android) define EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
- [ ] #2 A missing web client ID fails at sign-in with a readable message on both platforms instead of calling the native picker unconfigured
- [ ] #3 A non-demo EAS build without EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID fails during config evaluation, with the reason in the error
- [ ] #4 release.yml fails before submitting when the built bundle carries no Google web client ID
- [ ] #5 The EAS Android signing certificate's SHA-1 and SHA-256 are registered on the Firebase Android app
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
