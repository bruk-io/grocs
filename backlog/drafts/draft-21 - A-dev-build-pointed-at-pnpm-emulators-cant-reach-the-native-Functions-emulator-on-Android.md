---
id: DRAFT-21
title: >-
  A dev build pointed at pnpm emulators can't reach the native Functions
  emulator on Android
status: Draft
assignee: []
created_date: '2026-10-23 03:52'
labels: []
dependencies: []
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
- [ ] #1 A dev build on an Android emulator or device can call createKitchen/joinKitchen/findMyKitchen against the local Functions emulator successfully
<!-- AC:END -->
