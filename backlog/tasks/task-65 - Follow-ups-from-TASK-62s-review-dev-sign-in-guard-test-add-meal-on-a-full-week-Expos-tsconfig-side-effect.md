---
id: TASK-65
title: >-
  Follow-ups from TASK-62's review: dev sign-in guard test, add-meal on a full
  week, Expo's tsconfig side effect
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 21:14'
updated_date: '2026-11-07 13:49'
labels:
  - size-1
  - e2e
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the reviewer's close of TASK-62 (740b4bb). (1) native.ts's devSignIn guard (dev tools present AND connected to the emulators) is what keeps the dev-sign-in link off live data, but the route tests inject a fake devSignIn, so nothing fails if that line is edited wrongly. (2) e2e/add-meal.yaml taps the first 'Plan a meal' of the current week; a week with every day planned would fail it without a real bug (the reseed before each run prevents it today). (3) Starting Expo here writes apps/mobile/tsconfig.json (gitignored) extending expo/tsconfig.base, which breaks 15 vitest files until deleted; anyone who runs the flows hits it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A unit test fails if native.ts offers devSignIn in a build not connected to the emulators
- [x] #2 add-meal.yaml does not depend on the current week having an open day
- [x] #3 Running pnpm e2e leaves no apps/mobile/tsconfig.json behind, or the vitest suite is unaffected by it
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#1: the devSignIn decision moved to apps/mobile/src/composition/dev-sign-in-gate.ts (devSignInFor), which native.ts calls; dev-sign-in-gate.test.ts fails if a release build (no dev tools) or a dev build on live Firebase (no emulator functions) is offered it. #3: tools/e2e.ts runs the --build step through removingWhatItCreates, which deletes apps/mobile/tsconfig.json after prebuild if the run created it and keeps one that was already there (tested in tools/e2e.test.ts with a fake fs, including a failing step). Metro alone (expo start) did not recreate the file in this session; prebuild does. #2: add-meal.yaml steps a week ahead while no 'Plan a meal' shows, and after saving steps forward until the meal shows (saving returns the plan to this week: TASK-75). Proof on the iPhone simulator: filled every day of Alex's week with a scratch flow, then add-meal.yaml passed against the full week.

pnpm e2e --ios on the simulator (reseeded, normal week) after these changes: add-and-tick-item, add-meal, sign-in all passed. The two-device and household flows need an Android device too and were not run (Android SDK missing).

Check `pnpm check && pnpm typecheck && pnpm test` exited 0

(20 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/SharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/SharedRef.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/Platform.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/Font.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/environment/browser.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeViewManagerAdapter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/errors/UnavailabilityError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/errors/CodedError.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/requireNativeModule.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/registerWebModule.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/TypedArrays.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/PermissionsInterface.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/PermissionsHook.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/Refs.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/hooks/useReleasingSharedObject.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/hooks/useReleasingSharedObjectWithLifecycle.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/reload.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/LegacyEventEmitter.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/NativeModulesProxy.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-modules-core/build/worklets/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/ExpoFontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/serverContext.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/FontLoader.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/Asset.fx.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/Asset.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/AssetSources.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo/build/utils/getBundleOrigin.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo/build/utils/getBundleUrl.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/small-items/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files

 Test Files  139 passed (139)
      Tests  1771 passed (1771)
   Start at  08:48:57
   Duration  9.06s (transform 37.99s, setup 4.04s, import 116.99s, tests 42.25s, environment 21.58s)
```

Reviewed by philosophy:reviewer: closed. #1 met: dev-sign-in-gate.test.ts covers release build and dev-on-live cases; residual: native.ts's one call to devSignInFor is itself untested, so passing the wrong argument there (or bypassing the gate) would not fail a test; low, noted only. #2 met: add-meal.yaml steps a week ahead while no 'Plan a meal' shows; worker ran it against a fully planned week on the iOS simulator; its second repeat works around TASK-75. #3 met: removingWhatItCreates wraps the --build step, tested with a fake fs including a failing step. Full-tier check on TASK-72 passed check/typecheck/unit (1771 tests) but could not start the emulators (ports held by another session); CI 42377775413 covers the rest. Android flows not run (no SDK).
<!-- SECTION:NOTES:END -->
