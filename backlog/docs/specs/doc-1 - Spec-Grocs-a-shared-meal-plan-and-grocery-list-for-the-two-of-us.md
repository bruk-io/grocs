---
id: doc-1
title: 'Spec: Grocs, a shared meal plan and grocery list for the two of us'
type: specification
created_date: '2026-10-18 17:02'
updated_date: '2026-10-18 17:22'
---
Intent: TASK-1

The problem lives on the intent and is not restated here. Each requirement is checkable on its own so tasks can cite it. Design choices (how) are left to decision records, listed under Design questions.

## Requirements

### Accounts and the kitchen

- R1 Sign-in is Google only, on both apps. No other sign-in method is offered.
- R2 A signed-in person who has no kitchen can create one by giving it a name, and receives a shareable invite link and a short invite code.
- R3 Opening the invite link, or entering the code, makes that person a member of the kitchen. A kitchen holds at most two members. An invalid, expired or already-used invite shows an inline error on the screen where it was entered.
- R4 A member can read and write only their own kitchen's data. This is enforced on the server, not only in the app.

### Meal plan

- R5 A week runs Monday to Sunday, in the kitchen's time zone. Each day holds zero or more meals, shown in the order they were added.
- R6 A meal has a name (required) and an optional link (an http or https URL). It has no other fields.
- R7 Either member can add, rename, relink or remove a meal on any day of the current or a future week, and can move between weeks.
- R8 Removing a meal never deletes grocery items. It removes that meal's badge from them, and an item left with no badge stays on the list as an extra.

### Grocery list

- R9 Each kitchen has one grocery list per week. An item has a name, an optional amount as free text, an aisle, zero or more meal badges, the member who added it, and a state: to buy or in the cart.
- R10 An item can be added as an extra (no meal) or for a meal of that week, in which case it carries that meal's badge.
- R11 Items to buy are grouped by aisle. A new item's aisle is suggested from the kitchen's earlier choices for that name, and either member can change it.
- R12 When an item is added whose normalised name matches an item already on that week's list, the existing item shows an inline, non-modal prompt to combine them. Combining leaves one item that carries every badge and both amounts as written, with no unit conversion. Declining keeps both items, and the prompt does not return for that pair.
- R13 Ticking an item moves it to "In the cart"; unticking moves it back to its aisle.
- R14 "Clear the cart" removes in-cart items from the week's list view. They remain available to the aisle and amount suggestions in R11.

### Sync and conflicts

- R15 A change made on one phone appears on the other within 3 seconds when both phones are online (95th percentile on home Wi-Fi).
- R16 Everything except signing in and joining a kitchen works offline. Offline changes are kept on the phone across app restarts and are sent when the connection returns, with no action from the user.
- R17 Ticking and unticking record the resulting state, who did it and when. A tick is never sent as a toggle, so two people ticking the same item end with it in the cart.
- R18 When both members change the same field of the same item or meal, the most recent change wins. This includes one member ticking an item while the other unticks it: the later action wins. Changes to different fields of the same record are both kept.
- R19 Items added by both members offline that match by normalised name are never merged silently. After sync they show the combine prompt from R12.
- R20 A deleted item or meal never reappears because of a late or offline change made before the delete.
- R21 The app shows when it is offline and when changes are waiting to send.

### Activity and notifications

- R22 Every change produces an activity record (who, what, when), written in the same atomic write as the change itself.
- R23 While the app is open, a member sees a short in-app message when the other member adds something.
- R24 Push notifications for the other member's additions are off by default. Each member can turn them on and off in settings. The operating system's permission prompt appears only when a member turns them on.

### Architecture and import layers

- R25 The domain rules live in one TypeScript package used by both apps. Domain functions take data and return data; they never perform I/O, read the clock or generate ids.
- R26 The code is organised in layers, and each layer may import only what is listed here. Domain: nothing else in the project, and no I/O, platform or UI framework packages. Ports: domain. Application: domain and ports. Providers: ports, domain and third-party SDKs. UI: application and design tokens, never providers. App (the composition root): every layer, and it is the only place providers are chosen and wired.
- R27 The import rules in R26 are checked by an agent hook after every edit, by pre-commit and in continuous integration on every change. A violation fails the build with a message that names the rule and why it exists. There are no import cycles between packages, and providers do not import one another.
- R28 The SDK defines interfaces (ports) for the sync store, authentication, push notifications, local key-value storage, configuration, the clock, id generation and logging. Only the application layer calls them.
- R29 Each port has one shared contract test suite, and every provider for that port passes it in continuous integration.
- R30 The shapes of stored documents and activity records are defined once in the SDK with a schema version. Providers validate them on read and write.

### Logging

- R31 Every provider is wrapped once, at the composition root, by an instrumentation layer that logs each port call's port, method, duration, outcome and error. Providers and features contain no logging code of their own.
- R32 Every command runs through one dispatcher. Its logging middleware records the command type, duration, outcome and the types of the events returned. Each command gets a correlation id, which is attached to every log record written while it runs, together with the app version, platform and kitchen role.
- R33 Uncaught errors, unhandled promise rejections, UI render errors and screen changes are logged automatically by handlers installed once at app start.
- R34 Every log record has one structured shape (timestamp, severity, message, attributes, correlation id) that fits the OpenTelemetry log data model, so a hosted log service can be added later as one more provider.
- R35 Development builds log to the console. Release builds keep the most recent log records in a bounded buffer on the phone, which a member can copy from a diagnostics action.
- R36 Fields marked personal in the SDK's schemas (item names, amounts, meal names, links) are removed automatically before any log record is written. The logging port's contract tests fail if a personal field gets through.
- R37 Only the console provider writes to the console directly. Continuous integration flags any other direct console use.

### Shared UI

- R38 Both apps are built from one shared UI component library whose components are organised and named by the atomic design system: tokens, atoms, molecules, organisms and templates.
- R39 Design tokens are defined once and are the only source of colours, sizes, radii, type and motion in the UI library. Continuous integration flags raw values.

### Look, feel and access

- R40 Each screen has its mushroom host from the design. Tapping a mascot plays its reaction and a speech bubble, and the line is announced to screen readers.
- R41 All motion follows the operating system's reduce-motion setting.
- R42 Every touch target is at least 44 by 44 points, and text meets a 4.5:1 contrast ratio.

### Platforms and delivery

- R43 The app runs on a Google Pixel 10 Fold, on both the outer and inner screens, and keeps its state when the phone folds or unfolds.
- R44 The app runs on Shazya's iPhone on its current iOS version.
- R45 Builds reach both phones through private channels (TestFlight and Google Play internal testing), with no public store listing.

### Tests

- R46 Domain functions have unit tests. The merge rules in R17 to R20 also have property tests showing that the result doesn't depend on the order changes arrive in, that applying a change twice has no further effect, and that a delete is never undone.
- R47 Every command has a scenario test that runs against the in-memory fakes, including orderings where both members change the same record and where one member is offline.
- R48 Every port has an in-memory fake that passes the port's contract suite (R29).
- R49 The Firebase providers pass each port's contract suite against the Firebase emulators. Every Firestore security rule has at least one test that is allowed and one that is denied (R4).
- R50 UI component tests find elements by their accessible role and label.
- R51 End-to-end flows cover signing in, adding a meal, adding an item, ticking it, and a change reaching a second device. They run on development builds against the emulators.
- R52 Every test runs on a developer's machine with no access to production data and without Docker. One command starts the Firebase emulators with seed data.
- R53 Development builds offer a test sign-in that works with the Auth emulator. Release builds don't contain it (R1).
- R54 Changing the shape of a stored document or activity record bumps its schema version and adds a migration test (R30).

### Enforcement

- R55 Every rule that a script can check is enforced by that script, run by agent hooks, by pre-commit and in continuous integration. This covers at least the import layers (R26, R27), console use (R37), raw design values (R39), test presence for domain functions and commands (R46, R47), contract coverage of port methods (R48), allow and deny tests for security rules (R49), schema version bumps (R54), end-to-end flows pointing only at the emulators (R51, R52) and the test sign-in being absent from release builds (R53). Every failure message names the rule and why it exists.
- R56 Agent hooks run fast checks on the changed files after every edit and finish within 5 seconds. Checks on the whole change run before an agent finishes.
- R57 Changes that weaken a check are blocked by a hook before the edit and fail continuous integration: focusing or skipping a test, deleting a test, or loosening a check's configuration.
- R58 Rule files under `.claude/rules/` hold only guidance that no script can check. Each file holds one rule, is scoped to the paths it governs, and gives its reason. When a rule becomes checkable, it moves into a script and its file is deleted.

## Repository layout

One TypeScript workspace. Each folder under `packages/` is one layer from R26, apart from the providers, which are split by platform so they never import one another. Each folder under `apps/` is a composition root. Tests sit beside the code they test (`*.test.ts`).

```
grocs/
├── apps/
│   ├── mobile/                 Expo app, the phones' composition root
│   │   ├── app/                screens and navigation
│   │   ├── src/composition/    the only place providers are chosen, instrumented and wired (R26, R31)
│   │   ├── src/dev/            test sign-in and emulator settings, development builds only (R53)
│   │   └── e2e/                end-to-end flows (R51)
│   └── functions/              Cloud Functions, the server's composition root (push, R24)
├── packages/
│   ├── core/                   domain: pure functions and types, no I/O (R25)
│   │   ├── src/model/          kitchen, week, meal, item
│   │   ├── src/merge/          last-write-wins, set-not-toggle, tombstones, badge union (R17 to R20)
│   │   └── src/schema/         versioned document and activity shapes, personal-field marking (R30, R36)
│   ├── ports/                  one folder per port (R28)
│   │   └── src/<port>/         port.ts (the interface), fake.ts (in-memory), contract.ts (shared suite)
│   ├── application/            commands, the dispatcher and its middleware (R32)
│   │   ├── src/commands/
│   │   └── src/dispatch/
│   ├── providers-firebase/     Firestore sync store, Auth, push registration
│   ├── providers-device/       key-value storage, clock, ids, console logger, on-phone log buffer (R35)
│   ├── providers-server/       Admin SDK providers used by apps/functions
│   └── ui/                     shared component library (R38)
│       └── src/                tokens/, atoms/, molecules/, organisms/, templates/
├── firebase/
│   ├── firestore.rules         security rules (R4)
│   ├── firestore.rules.test.ts allow and deny tests (R49)
│   ├── firestore.indexes.json
│   └── seed/                   emulator seed data (R52)
├── tools/
│   ├── checks/                 one script per check, each failure naming its rule and reason (R55)
│   └── hooks/                  agent hook entry points that call the checks (R56, R57)
├── .claude/
│   ├── settings.json           hook wiring
│   └── rules/                  judgement-only rules, one per file (R58)
├── backlog/                    the board: intent, spec, tasks, decisions
├── firebase.json               emulator and deploy settings
├── lefthook.yml                pre-commit, calling tools/checks
└── CLAUDE.md
```

## Policies applied

- Engineering philosophy (Bruk's standing constraints): functional core and imperative shell (R25, R28), layers enforced by import rules rather than convention (R26, R27), validation as scripts rather than instructions to a model (R55, R58), no enforcement without the reason attached (R55), and never weakening a check to make it pass (R57).
- Privacy: personal content stays in the kitchen's own data and is stripped from logs by type (R36). Access is checked on the server (R4).
- Accessibility, using WCAG 2.2 AA as the baseline: contrast and target size (R42), reduce motion (R41), and announced mascot speech (R40).
- Platform guidelines: Google's sign-in branding rules for the sign-in button (R1), and Android large-screen guidance for the fold (R43).

## Areas of concern

- Resolved: R18 against the must-not-break line on ticks. When one member ticks and the other unticks at the same moment, the later action wins. Bruk accepted this as product owner on Oct 18, 2026, and it is now part of R18.
- R15 depends on the sync provider and the network. 3 seconds is a target on good connections, not a guarantee in a basement grocery store; R16 and R21 cover that case.
- R24 needs a small server-side function to send pushes. That is the first code outside the apps, and it must use the same SDK and ports.
- Resolved: R44 and R45 need a paid Apple Developer account for TestFlight. Bruk will sign up for one.
- R53 against R1: the test sign-in is a second way in. It is acceptable only because release builds don't contain it, and a check on release builds must prove that.
- R34 against R36, for later: if a hosted log service such as Datadog is added, its mobile tooling can capture screen text and view names by default. That provider must be configured so it doesn't, and it must pass the redaction tests in R36.

## Open questions

- [x] Combine flow for a shared ingredient: carried forward as design question D1. It shapes one interaction, not the requirements.
- [x] Fold inner-screen layout: carried forward as design question D2. It changes layout, not behaviour.
- [x] Carried forward: recipe-link ingredient extraction is parked by Bruk so it does not block the first version.
- [x] Carried forward: moving a dropped meal to the next week is parked by Bruk. A dropped meal stays where it is (R8).
- [x] A day can hold more than one meal (answered by Bruk; R5). The plan screens in the design show one meal per day and need updating.
- [x] Carried forward: telemetry (events, metrics and errors) and a Datadog provider are paused by Bruk. The log shape in R34 keeps the door open.

## Design questions

- D1 The playful inline flow for combining a shared ingredient on the duplicated item (R12, R19).
- D2 How the layout uses the Pixel 10 Fold's inner screen, and how it moves between postures (R43).
- D3 The workspace tooling behind the repository layout: package manager, task runner, and the tool that checks the import layers (R26, R27).
- D4 The sync model. The store is decided: Firebase, chosen by Bruk (decision-1, TASK-1.1). Still open: document shapes, field-level merges, tombstones, the activity outbox and the schema versioning (R15 to R22, R30).
- D5 How push notifications are sent: which server-side function, triggered by what, and how it respects each member's setting (R24).
- D6 Animation runtime for the mascots and the Welcome scene, and how it honours reduce motion (R40, R41).
- D7 The logging design: the port wrapper, the command middleware, the correlation context, the redaction marking and the on-phone buffer (R31 to R37).
- D8 The test tooling and its enforcement: test runners, the end-to-end tool, the check scripts and which hook runs each, the judgement-only rule files, and whether to add mutation testing on the domain later (R46 to R58).

## Out of scope

- Recipe-link ingredient extraction.
- Moving dropped meals forward.
- Any sign-in method other than Google.
- More than two members, or a person in more than one kitchen.
- A web app.
- Pantry stock, prices and store-specific aisle order.
- Sharing a list with anyone outside the kitchen.
- Third-party agent skills or plugins, such as Expo's or Callstack's. The repo uses Bruk's own agent setup.
- Telemetry (events, metrics, errors), paused by Bruk, and any hosted log or monitoring service such as Datadog.
