---
id: TASK-10.3
title: A demo build that runs on sample data with no account
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 17:01'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-10.6
  - TASK-10.8
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: friends install an APK and use the app without signing in. A demo variant of the app (APP_VARIANT=demo) with its own app id (io.bruk.grocs.demo) and name, so it installs beside a real build. Its composition runs on the in-memory fakes, seeded from the sample data, so Groceries, Plan and Settings work and adding and ticking items works on the phone; nothing leaves it. Welcome offers the way in (SignInTemplate's footer slot from TASK-1.37.11 is one option). The real app's release build must not carry any of it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With APP_VARIANT=demo the app config gives a distinct app id and name, and the app opens on Welcome with a way in that needs no account
- [ ] #2 In the demo, Groceries, Plan and Settings show sample data, and adding and ticking an item works, proven by route tests on the demo composition
- [ ] #3 check:release still proves the real release bundles carry no demo or fake code, and fails if they do
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. app.config.ts: APP_VARIANT=demo gives name 'Grocs Demo', id io.bruk.grocs.demo (ios and android), no Firebase plugins, no googleServicesFile. 2. src/composition/create-app.ts: the one build-time gate on EXPO_PUBLIC_APP_VARIANT; requires the demo or native composition, so a real bundle drops apps/mobile/src/demo and providers-memory, and the demo bundle drops native.ts and Firebase. 3. src/demo/: composeDemoApp on MemoryAuth + MemorySyncStore, seeded from sample-data.ts; createDemoApp wires device pieces. 4. NativeApp gains demo (null in real); WelcomeScreen footer 'Try the demo'; Home uses the demo kitchen id. 5. Route tests in src/demo on the demo composition. 6. Add @grocs/providers-memory to apps/mobile deps. 7. Run check, typecheck, test, check:release, and a demo expo export into a scratch dir. Known gap: no command ticks an item (AddItem is the only command; the Groceries screen has no onToggleItem), so ticking needs an application-layer command first.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 19, 2026: the builder stopped before editing. The demo would have needed the test fakes, which import-layers rightly keeps test-only, and check:release can't see fakes at all. Bruk chose a real in-memory provider (decision-12). This task now builds the demo composition on packages/providers-memory (TASK-10.8), and its criterion 3 relies on the stricter release check (TASK-10.6). Builder's findings for TASK-10.4: native.ts imports @react-native-firebase at the top level, so the demo must reach it only through a build-time gate (EXPO_PUBLIC_APP_VARIANT); the Firebase config plugins and googleServicesFile must be skipped in the demo variant, and Firebase may need excluding from autolinking or the app crashes at launch without google-services.json.

Unblocked Oct 19, 2026: TASK-10.8 (packages/providers-memory: MemoryAuth with signInAsDemoMember(), MemorySyncStore) and TASK-10.6 (check:release bars test fakes, contract suites, apps/mobile/src/demo/ and packages/providers-memory/ from real release bundles, with a blindSpots self-check) are on main. Keep every demo-only file under apps/mobile/src/demo/: the blindSpots sweep fails on a demo-named file outside it that no pattern matches. The demo variant's own bundle legitimately holds demo code, so check:release cannot judge it unchanged; that belongs to TASK-10.4, not here.

Oct 19, 2026, builder-app report. Built: app.config.ts demo variant (APP_VARIANT=demo: name 'Grocs Demo', io.bruk.grocs.demo on both platforms, scheme grocs-demo, only the expo-router plugin, no googleServicesFile); src/composition/create-app.ts is the one build-time gate on EXPO_PUBLIC_APP_VARIANT (root layout now calls createApp); src/demo/ holds composeDemoApp (MemoryAuth + MemorySyncStore, seeded with this week's sample produce and meat, kitchen 'demo-kitchen'), createDemoApp and demo.route.test.tsx; NativeApp gained demo (null in the real app); WelcomeScreen footer shows 'Try the demo' (MemoryAuth.signInAsDemoMember); apps/mobile depends on @grocs/providers-memory (package.json, lockfile entry written by hand, symlink made in node_modules). Proof: pnpm check, typecheck, test (1236) pass; check:release clean, and it FAILS with release-bundle/demo-in-release when run with EXPO_PUBLIC_APP_VARIANT=demo (so the gate is what keeps the demo out). A demo-variant expo export (APP_VARIANT=demo EXPO_PUBLIC_APP_VARIANT=demo, same flags as tools/release-bundle.ts) into a scratch dir works: android and ios bundles, 5 demo/in-memory modules, zero Firebase modules, no composition/native.ts. AC1 and AC3 met. AC2 is NOT met for ticking: AddItem is the only command and GroceriesScreen passes no onToggleItem, so there is nothing to tick with; adding an item and the sample Groceries, Plan and Settings are proven by route tests. Ticking needs a command (for example SetItemState) in packages/application, with a scenario test, then a screen wiring in apps (a small follow-up for builder-app). Needed by TASK-10.4 (native build, not done here): run prebuild/gradle with APP_VARIANT=demo and EXPO_PUBLIC_APP_VARIANT=demo both set (the first picks the config, the second the composition; they must agree); no google-services.json is needed in the demo config, but @react-native-firebase/app is still a dependency of apps/mobile, so autolinking will still compile it into the APK and its init provider may log or crash without a google-services.json - verify on a device or emulator, and if it does, exclude it from autolinking for the demo (expo.autolinking exclude, or a prebuild step) since package.json is not variant-aware; the Android build must also not pick up the Firebase google-services Gradle plugin (it is added by the @react-native-firebase/app config plugin, which the demo variant skips); expo-build-properties and withFirebaseConfigure are also skipped in the demo; the CI step should also confirm that the real release job does not set either variable; check:release does not inspect the demo bundle (TASK-10.4).
<!-- SECTION:NOTES:END -->
