---
id: DRAFT-21
title: >-
  A dev build pointed at pnpm emulators can't reach the native Functions
  emulator on Android
status: Draft
assignee: []
created_date: '2026-10-23 03:52'
updated_date: '2026-10-24 03:46'
labels: []
dependencies: []
modified_files:
  - apps/mobile/src/dev/index.ts
  - apps/mobile/src/composition/native.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
tools/emulators.ts (pnpm emulators) starts only \`firestore,auth\` (\`--only firestore,auth\`), not \`functions\`, even though firebase.json configures a functions emulator on port 5001 and apps/mobile/src/dev/index.ts unconditionally calls \`connectFunctionsEmulator(getFunctions(), host, 5001)\`. A dev build has a dangling Functions connection by construction when run against the documented \`pnpm emulators\` workflow.

Separately, even after manually starting the Functions emulator too (\`firebase emulators:start --only firestore,auth,functions\`), a real (non-demo) Android debug build connected via Metro (adb reverse tcp:8081, EXPO_PUBLIC_EMULATOR_HOST left at its default \`10.0.2.2\`) could sign in against the Auth emulator successfully, but every \`findMyKitchen\`/\`createKitchen\`/\`joinKitchen\` callable-function call never reached the Functions emulator (zero server-side log lines, confirmed over several repeated taps with fresh app-data clears). The same calls succeed immediately via the web SDK against the identical running emulators (packages/providers-firebase/src/kitchen-gateway.emulator.test.ts, 18/18 passing). Tried overriding EXPO_PUBLIC_EMULATOR_HOST to 127.0.0.1 with adb reverse for all three ports (5001, 8080, 9099) - the native SDK logs "Mapping functions host ... to 10.0.2.2 for android emulators" regardless (an automatic remap the SDK does unless \`android_bypass_emulator_url_remap\` is set), so this did not change anything, and the result was the same.

Not root-caused: this needs either a real device/different emulator image to rule out this specific AVD, the \`android_bypass_emulator_url_remap\` flag, or the officially-supported \`expo run:android\` dev-client flow (which sets up its own port forwarding) instead of a manual \`expo start\` + \`adb reverse\` setup, which is what this investigation used.

## Affected users and systems
tools/emulators.ts, apps/mobile/src/dev/index.ts; anyone manually testing the real app's create-kitchen/join-kitchen/find-kitchen flow against local emulators on Android.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A dev build on an Android emulator or device can call createKitchen/joinKitchen/findMyKitchen against the local Functions emulator successfully
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root-caused and fixed (2026-10-24, Claude, overnight while Bruk slept - he asked for this one fixed).

Root cause: not a reachability/networking problem. The native app's Firebase config (google-services.json, project `io-bruk-grocs-dev`) is baked in at build time; @react-native-firebase has no runtime project override. `connectFunctionsEmulator(getFunctions(), host, port)` only redirects host:port - the callable URL's project-id segment still comes from the app's own config. The local Functions emulator serves only under `demo-grocs` (tools/emulators.ts's PROJECT constant, required by firebase-isolation R51/R52). Every call built a URL like `http://10.0.2.2:5001/io-bruk-grocs-dev/us-central1/createKitchen`, which the emulator 404s (confirmed empirically: curl'd the emulator directly with the real project id and a garbage one - both flat 404; `demo-grocs` returns 401 as expected for an unauthenticated call. `singleProjectMode: true` in firebase.json does not bypass this for Functions HTTP routing, firebase-tools 15.34.0). The emulator's own log shows zero lines for any of these calls (not even a 404 access log), which is why this looked like a pure connectivity/unreachable-host problem the first time around. Auth and Firestore emulators connect fine because those protocols don't require an exact project-id path match the way Functions' HTTP trigger router does.

Ruled out before finding this: `expo run:android`'s official port-forwarding instead of manual `adb reverse` (draft's original suggestion) - made no difference, same "not-found" with zero emulator-side log lines. `getFunctions(undefined, customDomain)` (its documented fix on the web SDK) - the native Android module does not honor the customDomain argument the same way; still "not-found" after a fully clean Metro bundle (cache cleared, confirmed via a distinctive rebuild).

Fix: `apps/mobile/src/dev/index.ts`'s `connectEmulators()` now returns a `FunctionsFns` (not a bare `Functions` instance) whose `httpsCallable` is built on `httpsCallableFromUrl(instance, \`http://${host}:5001/${DEMO_PROJECT}/us-central1/${name}\`)` instead of the project-id-derived default - DEMO_PROJECT imported from firebase/seed/data.ts, the same constant tools/emulators.ts already uses. `apps/mobile/src/composition/native.ts` swaps in this FunctionsFns in place of the real module when EXPO_PUBLIC_USE_EMULATORS is on (the default), alongside the real `instance` value (unused by this FunctionsFns, which closes over its own - kept only so the field stays non-optional). Zero changes to packages/providers-firebase or packages/ports - FirebaseKitchenGateway still just calls `this.#fns.httpsCallable(this.#functionsInstance, name)` generically, with no idea it's talking to an emulator (providers hold no rules).

Verified end to end on a real Android emulator (the "fold" AVD) against `pnpm emulators`, built via `expo run:android` then iterated against a clean `expo start --dev-client --clear` Metro session (ruling out bundle-cache ambiguity): signed in via the dev test sign-in, `findMyKitchen` now returns `ok` (was `not-found`), then `createKitchen` succeeded end to end - got a real invite code (BIRCH-9389) and the "waiting for your partner to join" screen. Did not empirically test `joinKitchen` from a second client tonight (no second device driven), but it goes through the identical `FunctionsFns.httpsCallable` path as the other two, so the same fix applies by construction.

Full suite green after the fix: pnpm check, pnpm typecheck, pnpm test (117 files, 1548 tests) all pass.

One unrelated thing found and fixed along the way, same session: `expo run:android`/`expo start` auto-generates a local apps/mobile/tsconfig.json that's gitignored specifically because it's known to break vitest/typecheck (see the .gitignore comment right above that line) - hit this, deleted it (not edited it) each time it reappeared, matching what the comment already says to do.

Not yet done: AC1 only covers Android (this session's device access). iOS wasn't re-tested against this fix. Nothing commits itself - all of this is still uncommitted locally, ready for review.
<!-- SECTION:NOTES:END -->
