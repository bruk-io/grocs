---
id: TASK-1.4
title: 'Walking skeleton: add an item and see it on a second client'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 17:38'
updated_date: '2026-10-18 18:37'
labels:
  - size-5
  - architecture
milestone: m-0
dependencies:
  - TASK-1.3
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The thinnest path through every layer, built in one session to discover the shapes of the ports, dispatcher and wiring before layer agents take over (decision on the agent workflow). Cites R15, R25, R28, R29, R30, R31, R32, R34, R36, R46, R47, R48, R49, R50, R53, R59, R63, R64, R65. Findings feed D4, D7, D8 and D9 and the layer agent configs; write them in the notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 core: adding an extra item to a week's list and normalising its name are pure functions with unit tests; one field-level last-write-wins merge has a property test (R25, R46)
- [x] #2 ports: sync store, auth, clock, ids and logging each have an interface, an in-memory fake and a contract suite, and every fake passes its suite (R28, R29, R48)
- [x] #3 application: an addItem command runs through one dispatcher whose logging middleware records type, duration, outcome and events with a correlation id; a scenario test runs it against the fakes (R32, R47)
- [x] #4 providers: the Firestore sync store and the Auth provider pass the same contract suites against the emulators (R49); the stored item shape has a schema version and is validated on read and write (R30)
- [x] #5 Every provider is wrapped once at the composition root by the instrumentation layer, and a test proves personal fields (item names) never reach a log record (R31, R34, R36)
- [x] #6 Two clients against the emulators: an item added on one appears on the other within 3 seconds, shown by an automated test (R15)
- [x] #7 ui: tokens come from one tokens.json (R59); one item-row molecule and the atoms it needs each have a story per state; the browser Storybook builds and component tests render the stories (R63 to R65)
- [x] #8 app: an Expo app with one list screen and an add bar, wired at the composition root, signs in with a test sign-in against the Auth emulator in development builds only (R53); Android and iOS bundles build
- [x] #9 Notes list what this workspace could not verify (device runs) and the findings for D4, D7, D8, D9 and the layer agent configs
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
BUILT (commits 9bb7b55, 227188d, 9cd0f29, b0cefca). core: Stamped last-write-wins merge, Item, createExtraItem, normaliseName, weekIdFor, ItemDoc schema v1 codec, redact. ports: Clock, IdGenerator, Logger, AuthPort (+ separate TestSignIn), SyncStore, each with in-memory fake and contract suite; fakes and suites live in the separate entry @grocs/ports/testing. application: dispatcher with middleware, loggingMiddleware, AddItem command, watchWeekItems and watchSession queries, instrumentPort and instrumentDeps (Proxy wrappers), createTestClient in @grocs/application/testing. providers-device: SystemClock, RandomIds, ConsoleLogger, BufferLogger. providers-firebase: FirestoreSyncStore, FirebaseAuth. ui: tokens.json to tokens.ts generator, 5 atoms, ItemRow molecule, a story per state, Storybook 10 web build. apps/mobile: Expo SDK 58 with expo-router, composition root (compose-app, compose-firebase, native), list screen with add bar, dev sign-in screen, dev tools loaded under __DEV__.

AC EVIDENCE. #1 pnpm vitest run --project unit: core tests incl. fast-check LWW properties (commutative, associative, idempotent) pass. #2 each port has interface, fake and contract suite; the port-contracts check fails if a method has no contract case, a fake does not run the contract, or a provider does not. #3 packages/application/src/commands/add-item.scenario.test.ts runs AddItem on fakes; loggingMiddleware logs type, duration, outcome, events, correlation id (dispatcher and instrument tests). #4 pnpm test:emulator: FirestoreSyncStore and FirebaseAuth run syncStoreContract and authContract against the emulators; schema version checked on read and write (22 emulator tests pass). #5 composeApp wraps every port once with instrumentDeps; two-client.emulator.test.ts uses a non-redacting logger and asserts the item name never appears in any record (the instrumentation logs port, method, duration, outcome, never arguments). #6 two-client.emulator.test.ts: client A dispatches AddItem, client B sees it; 5 rounds each under 3000 ms, measured. #7 pnpm vitest run --project ui: 38 tests render every story; pnpm --filter @grocs/ui build-storybook completes; one tokens.json, design-tokens check verifies sync, no raw values, contrast. #8 apps/mobile: pnpm --filter @grocs/mobile export builds Android and iOS bundles; pnpm check:release builds dev and release bundles for both; ListScreen.test.tsx adds an item through the real composeApp on fakes; FirebaseTestSignIn passes testSignInContract against the Auth emulator.

HOW CONTRACTS AND SYNC RUN WITH NATIVE FIREBASE (asked for). @react-native-firebase cannot run in Node. The Firebase providers take the modular API by injection (FirestoreFns, AuthFns, via asSdk) and never import an SDK. Native @react-native-firebase v26 exposes the same modular functions (getFirestore, doc, runTransaction, onSnapshot, getAuth, onAuthStateChanged...), so the phone passes the native module and the emulator tests pass the web SDK (firebase/firestore, firebase/auth) pointed at the emulators. Gap: the native module, its Android and iOS bridge, and offline persistence behaviour are not exercised; web SDK and native SDK can differ in behaviour (listener ordering, error codes, offline cache). Mitigation for D4: a device test later with the same contract suites run on a real emulator-connected build (Detox or Maestro) and a thin SDK-compatibility test listing every function the providers use.

TOOL CHOICES (provisional, for D3, D8, D9). Storybook: 10.6 with @storybook/react-native-web-vite for the browser build and component tests via composeStories; on-device Storybook (@storybook/react-native) NOT built here, see not verified. Tokens: tokens.json plus tools/build-tokens.ts (our script, checked in sync); rejected Style Dictionary (heavy for one platform-neutral JSON and one TS output). UI tests: vitest with jsdom 26 and react-native-web alias plus Testing Library; rejected jest-expo and React Native Testing Library (needs jest and a native preset) and jsdom 30 (needs undici under hoisted linker). Property tests: fast-check. Router: expo-router. Dev-only code exclusion: if (__DEV__) require(...) in apps/mobile/src/composition/load-dev.ts; Metro folds __DEV__ and drops the branch. Rejected separate dev and release entry files (duplicates the root) and build-time env flags (easy to forget).

FINDINGS. D4 (sync and data): LWW per field with permanent delete tombstone and unioned badges merges in a Firestore transaction; transactions fail while offline, so R16 (works offline) is NOT met by this skeleton. Decide between a transaction-free per-field write (merge with field paths) and queued commands. D7 (observability): instrumentation as Proxy around every port logs port, method, duration, outcome, error, never arguments, which is how item names stay out; redact() is only a second line. LogRecord shape maps to OpenTelemetry. D8 (guardrails): Metro does not tree-shake, so any export reachable from a shipped file is in the release bundle. The first release-bundle run found FakeAuth, with a plain password, and the contract suites inside the release bundle through the ports barrel. Fix: fakes and contracts moved to @grocs/ports/testing and @grocs/application/testing, with an import-layers rule limiting them to tests. The release-bundle check (tools/release-bundle.ts) exports dev and release, requires the marker in dev (so the check can fail) and none in release. D9 (tooling): Node 22 type stripping removes any build step for checks; needs erasable syntax and .ts extensions; hoisted linker needed for Metro, and metro-cache needed exponential-backoff added to apps/mobile devDependencies.

PER-LAYER AGENT CONFIG. core: pure functions only, no imports; example packages/core/src/merge/item-merge.ts and its property tests. ports: interface plus fake plus contract suite together, describe intent not SDK; example packages/ports/src/sync-store/ (port, fake, contract). Tests import from @grocs/ports/testing. application: one command per file with a scenario test on the fakes, register in commands/index.ts; example commands/add-item.ts and add-item.scenario.test.ts. providers-*: hold no rules, take the SDK by injection, pass the shared contract suite; example providers-firebase/src/firestore-sync-store.ts. ui: props and callbacks only, tokens only, export NAME_STATES and one PascalCase story per state; example molecules/ItemRow.tsx and atoms/Checkbox.tsx. app: wire at the composition root, screens use the App facade and never a port; example apps/mobile/src/composition/compose-app.ts and screens/ListScreen.tsx. Dev-only code goes in apps/mobile/src/dev and loads only through load-dev.ts.

NOT VERIFIED. Nothing ran on an Android or iOS device or simulator: the screens, native @react-native-firebase modules, emulator host (10.0.2.2 on Android), keyboard and touch behaviour are untested; only the JS bundles build (expo export, both platforms, dev and release). The test sign-in runs in the app only through the web SDK in tests, not through the native Auth module. On-device Storybook is not built (needs @storybook/react-native and a dev client); the browser Storybook is. Native config (google-services files, expo prebuild, Google sign-in) is absent, so a dev client build was not attempted. Offline behaviour (R16) not met, see D4. Firestore security rules have no rules-unit tests yet. The release-bundle check looks for three marker strings; a leak under other names would pass. The 3 second sync test measures the web SDK on a local emulator, not a mobile network. CI has not run.

REVIEW (reviewer, 2026-10-18): closed. Re-ran test:emulator (two-client test with 3000 ms budget, log-redaction test, provider contract suites pass), check:release (Android and iOS dev and release exports; release free of dev markers), ui build-storybook (succeeds), test (component tests render stories). Device-only, not verified and not claimed: screens on a device, native @react-native-firebase modules, on-device Storybook, native Firebase config; #8 is met on the JS bundles and dev-only test sign-in excluded from release, not on a device. Known limits, no task filed: release-bundle check matches 3 marker strings only; Firestore security rules have no rules tests; R16 offline unmet (D4), outside these criteria. Missing check tier: DRAFT-1.
<!-- SECTION:NOTES:END -->
