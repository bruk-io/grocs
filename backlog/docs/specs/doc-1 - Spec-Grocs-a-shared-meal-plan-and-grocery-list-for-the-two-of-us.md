---
id: doc-1
title: 'Spec: Grocs, a shared meal plan and grocery list for the two of us'
type: specification
created_date: '2026-10-18 17:02'
updated_date: '2026-10-18 17:02'
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

- R5 A week runs Monday to Sunday, in the kitchen's time zone. Each day holds zero or one meal.
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
- R18 When both members change the same field of the same item or meal, the most recent change wins. Changes to different fields of the same record are both kept.
- R19 Items added by both members offline that match by normalised name are never merged silently. After sync they show the combine prompt from R12.
- R20 A deleted item or meal never reappears because of a late or offline change made before the delete.
- R21 The app shows when it is offline and when changes are waiting to send.

### Activity and notifications

- R22 Every change produces an activity record (who, what, when), written in the same atomic write as the change itself.
- R23 While the app is open, a member sees a short in-app message when the other member adds something.
- R24 Push notifications for the other member's additions are off by default. Each member can turn them on and off in settings. The operating system's permission prompt appears only when a member turns them on.

### Architecture

- R25 The domain rules live in one TypeScript package used by both apps. It imports no I/O, platform or UI framework code, and continuous integration fails if it does.
- R26 The SDK defines interfaces (ports) for the sync store, authentication, push notifications, local key-value storage, configuration, the clock, id generation, logging and telemetry. Only the application layer calls them; domain functions take data and return data.
- R27 Each port has one shared contract test suite, and every provider for that port passes it in continuous integration.
- R28 The shapes of stored documents and activity records are defined once in the SDK with a schema version. Providers validate them on read and write.
- R29 Logging goes only through the logging port, with levels and structured fields. Development builds use a console provider and release builds a no-op provider by default.
- R30 Telemetry (events, metrics, errors) goes only through the telemetry port. The default provider does nothing. A Datadog provider can be added later without changing domain or application code.
- R31 No personal content (item names, amounts, meal names, links) is passed to the logging or telemetry ports.
- R32 Both apps are built from one shared UI component library whose components are organised and named by the atomic design system: tokens, atoms, molecules, organisms and templates.
- R33 Design tokens are defined once and are the only source of colours, sizes, radii, type and motion in the UI library. Continuous integration flags raw values.

### Look, feel and access

- R34 Each screen has its mushroom host from the design. Tapping a mascot plays its reaction and a speech bubble, and the line is announced to screen readers.
- R35 All motion follows the operating system's reduce-motion setting.
- R36 Every touch target is at least 44 by 44 points, and text meets a 4.5:1 contrast ratio.

### Platforms and delivery

- R37 The app runs on a Google Pixel 10 Fold, on both the outer and inner screens, and keeps its state when the phone folds or unfolds.
- R38 The app runs on Shazya's iPhone on its current iOS version.
- R39 Builds reach both phones through private channels (TestFlight and Google Play internal testing), with no public store listing.

## Policies applied

- Engineering philosophy (Bruk's standing constraints): functional core and imperative shell (R25, R26), checks that run as scripts in CI rather than by memory (R25, R27, R33), and a concrete case before an abstraction.
- Privacy: personal content stays in the kitchen's own data and is kept out of logs and telemetry (R31). Access is checked on the server (R4).
- Accessibility, using WCAG 2.2 AA as the baseline: contrast and target size (R36), reduce motion (R35), and announced mascot speech (R34).
- Platform guidelines: Google's sign-in branding rules for the sign-in button (R1), and Android large-screen guidance for the fold (R37).

## Areas of concern

- R18 against the must-not-break line on ticks: last-write-wins means that if one member ticks an item while the other unticks it at the same moment, the later action wins. Ticking the same way always converges (R17), but opposite actions cannot both win. Bruk, as product owner, should confirm that this is acceptable.
- R15 depends on the sync provider and the network. 3 seconds is a target on good connections, not a guarantee in a basement grocery store; R16 and R21 cover that case.
- R24 needs a small server-side function to send pushes. That is the first code outside the apps, and it must use the same SDK and ports.
- R38 and R39 need a paid Apple Developer account for TestFlight. That is a cost and an account decision for Bruk.
- R30 against R31: Datadog's mobile tooling can capture screen text and view names by default. A future Datadog provider must be configured so it doesn't, and the contract suite for the telemetry port should test that personal fields are rejected.

## Open questions

- [x] Combine flow for a shared ingredient: carried forward as design question D1. It shapes one interaction, not the requirements.
- [x] Fold inner-screen layout: carried forward as design question D2. It changes layout, not behaviour.
- [x] Carried forward: recipe-link ingredient extraction is parked by Bruk so it does not block the first version.
- [x] Carried forward: moving a dropped meal to the next week is parked by Bruk. A dropped meal stays where it is (R8).
- [ ] Carried forward: R5 assumes one meal per day. If a day needs more than one (lunch and dinner), only R5 and the plan screens change, so it can be settled before the plan work starts.

## Design questions

- D1 The playful inline flow for combining a shared ingredient on the duplicated item (R12, R19).
- D2 How the layout uses the Pixel 10 Fold's inner screen, and how it moves between postures (R37).
- D3 Repository and package layout for the TypeScript SDK, providers, UI library and app, and how the import boundaries are enforced (R25, R26, R32).
- D4 The sync model: the store, document shapes, field-level merges, tombstones, the activity outbox and the schema versioning (R15 to R22, R28).
- D5 How push notifications are sent: which server-side function, triggered by what, and how it respects each member's setting (R24).
- D6 Animation runtime for the mascots and the Welcome scene, and how it honours reduce motion (R34, R35).

## Out of scope

- Recipe-link ingredient extraction.
- Moving dropped meals forward.
- Any sign-in method other than Google.
- More than two members, or a person in more than one kitchen.
- A web app.
- Pantry stock, prices and store-specific aisle order.
- Sharing a list with anyone outside the kitchen.
- Setting up Datadog itself. Only the telemetry port and its no-op provider are in scope.
