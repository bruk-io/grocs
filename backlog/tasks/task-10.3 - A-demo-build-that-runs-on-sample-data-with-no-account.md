---
id: TASK-10.3
title: A demo build that runs on sample data with no account
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 17:18'
labels:
  - size-3
  - layer-app
  - finish-moved
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
- [x] #1 With APP_VARIANT=demo the app config gives a distinct app id and name, and the app opens on Welcome with a way in that needs no account
- [x] #2 check:release still proves the real release bundles carry no demo or fake code, and fails if they do
- [x] #3 In the demo, Groceries, Plan and Settings show sample data, and adding an item works, proven by route tests on the demo composition
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

Finish line moved by the orchestrator (Oct 19, 2026): criterion 2 no longer asks for ticking an item. There is no command for it yet; ticking belongs to the planned slice TASK-1.23 (Shopping: we tick items off while shopping), and building it here would jump ahead of that slice across two layers. The demo runs the real application commands on the in-memory provider, so it gains ticking when TASK-1.23 lands, with nothing demo-specific to add. Bruk can pull TASK-1.23 forward if he wants ticking in the first demo.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(520 earlier lines omitted)
```text
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

|
!  Vite [plugin builtin:vite-reporter]
|  (!) Some chunks are larger than 500 kB after minification. Consider:
|  - Using dynamic import() to code-split the application
|  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
|  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
|  - Adjust chunk size limit for this warning via
|  build.chunkSizeWarningLimit.
|
!  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
|  shimmed in module "../../node_modules/react-native-web/dist/index.js".

|  Vite ✓ built in 4.96s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.0s of this 4.9s
|  build (61%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (26%, 1.3s, 822
|  calls)
|  - plugin vite:css transform (23%, 1.1s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a8af323fdcb0024c1/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a8af323fdcb0024c1/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review by philosophy:reviewer (Oct 19, 2026): closed. Full-tier check exited 0 with no files rewritten. AC1: expo config with APP_VARIANT=demo resolves to 'Grocs Demo', io.bruk.grocs.demo on both platforms, only the expo-router plugin, no googleServicesFile; the real config is unchanged (io.bruk.grocs.dev, all Firebase plugins). The demo route test opens on Welcome with Try the demo. AC2: check:release is clean on the real build, and with EXPO_PUBLIC_APP_VARIANT=demo it fails with release-bundle/demo-in-release, naming src/demo and providers-memory, so create-app.ts's gate is what keeps the demo out. AC3: demo.route.test.tsx covers sample Groceries, Plan, Settings and adding an item. Imports: @grocs/ports/testing appears only in demo.route.test.tsx; the demo composition uses @grocs/providers-memory; demo-only files are all under apps/mobile/src/demo/ (shared files carry only the DemoAccess type, the null field, the gate and the inert TryDemo footer). Real app: demo is null in createNativeApp and appOnFakes, and the existing route tests plus the new 'not the demo' case pass. Lockfile: pnpm install --frozen-lockfile reports up to date and changes nothing. Demo export (APP_VARIANT=demo EXPO_PUBLIC_APP_VARIANT=demo, release flags, to a scratch dir outside the repo): android and ios bundles each hold the 5 demo and in-memory modules, no Firebase source and no composition/native.ts. Moved finish line: sound. Ticking needs an application command that TASK-1.23 owns, and the demo inherits it through the real commands; it is recorded with the finish-moved label, a note and its own commit. Finding (low, not filed): that note says 'criterion 2' but the move also put that criterion third, so it now reads as #3. No drafts filed.
<!-- SECTION:NOTES:END -->
