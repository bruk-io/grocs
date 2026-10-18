---
id: doc-1
title: 'Spec: Grocs, a shared meal plan and grocery list for the two of us'
type: specification
created_date: '2026-10-18 17:02'
updated_date: '2026-10-18 17:09'
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
- R27 The import rules in R26 are checked in continuous integration on every change. A violation fails the build with a message that names the rule and why it exists. There are no import cycles between packages, and providers do not import one another.
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

## Policies applied

- Engineering philosophy (Bruk's standing constraints): functional core and imperative shell (R25, R28), layers enforced by import rules rather than convention (R26, R27), and checks that run as scripts in continuous integration rather than by memory (R27, R29, R37, R39).
- Privacy: personal content stays in the kitchen's own data and is stripped from logs by type (R36). Access is checked on the server (R4).
- Accessibility, using WCAG 2.2 AA as the baseline: contrast and target size (R42), reduce motion (R41), and announced mascot speech (R40).
- Platform guidelines: Google's sign-in branding rules for the sign-in button (R1), and Android large-screen guidance for the fold (R43).

## Areas of concern

- Resolved: R18 against the must-not-break line on ticks. When one member ticks and the other unticks at the same moment, the later action wins. Bruk accepted this as product owner on Oct 18, 2026, and it is now part of R18.
- R15 depends on the sync provider and the network. 3 seconds is a target on good connections, not a guarantee in a basement grocery store; R16 and R21 cover that case.
- R24 needs a small server-side function to send pushes. That is the first code outside the apps, and it must use the same SDK and ports.
- Resolved: R44 and R45 need a paid Apple Developer account for TestFlight. Bruk will sign up for one.
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
- D3 Repository and package layout for the SDK, providers, UI library and app, and the tool and rule set that enforce the import layers (R25 to R27, R38).
- D4 The sync model: the store, document shapes, field-level merges, tombstones, the activity outbox and the schema versioning (R15 to R22, R30).
- D5 How push notifications are sent: which server-side function, triggered by what, and how it respects each member's setting (R24).
- D6 Animation runtime for the mascots and the Welcome scene, and how it honours reduce motion (R40, R41).
- D7 The logging design: the port wrapper, the command middleware, the correlation context, the redaction marking and the on-phone buffer (R31 to R37).

## Out of scope

- Recipe-link ingredient extraction.
- Moving dropped meals forward.
- Any sign-in method other than Google.
- More than two members, or a person in more than one kitchen.
- A web app.
- Pantry stock, prices and store-specific aisle order.
- Sharing a list with anyone outside the kitchen.
- Telemetry (events, metrics, errors), paused by Bruk, and any hosted log or monitoring service such as Datadog.
