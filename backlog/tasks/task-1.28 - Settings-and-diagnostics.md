---
id: TASK-1.28
title: Settings and diagnostics
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-20 17:30'
labels:
  - size-2
  - slice
  - finish-moved
milestone: m-3
dependencies:
  - TASK-1.4
  - TASK-1.18
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the skeleton. Cites R35.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Settings holds the notifications toggle, copy diagnostics and sign out
- [ ] #2 Copy diagnostics copies the recent log records from the on-phone buffer, with no personal content
- [ ] #3 Uncaught errors, unhandled rejections, render errors and screen changes are logged by handlers installed once at app start (R33)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: added the R33 criterion, which no task cited.

Plan (builder-app, app layer only). 1) apps/mobile/src/composition/observe.ts: installObservers (once; ErrorUtils global handler keeping the previous one; Hermes rejection tracker behind a HermesInternal guard; one app-<id> correlation id), observer() for the layout's ErrorBoundary, routePattern(). Error records carry name/code and source only, never the message. 2) diagnostics.ts builds the header line (version, platform, build) + BufferLogger.dump(); NativeApp.diagnostics becomes non-null (dev/demo copy the header plus a note). Native installs observers before the first render. 3) _layout.tsx: ErrorBoundary with retry, useSegments effect logging the route pattern. 4) SettingsScreen: real session user, sign out via app.signOut then Welcome, Copy diagnostics via app.copyText. 5) Notifications toggle: PreferencesTemplate has no disabled prop for its switch, so disabling needs a ui change (stop and tell). I leave onNotificationsChange unset, so the switch is off and inert, and report it. 6) Tests: observe unit tests, settings route tests on FakeClipboard with a real BufferLogger (no item name, no email in the copy), ErrorBoundary test.

Report (builder-app). Built: observe.ts (installObservers once from createNativeApp; ErrorUtils handler keeps the previous one; Hermes tracker behind a HermesInternal guard; one app-<id> correlation id; error records carry source, name, code, route, never the message or a pathname), diagnostics.ts (header 'grocs diagnostics - version, platform, build' + BufferLogger.dump()), root ErrorBoundary with retry and a useSegments route-pattern effect in app/_layout.tsx, SettingsScreen on the real session with working sign out and Copy diagnostics via app.copyText. NativeApp.diagnostics is now non-null (dev and demo copy the header plus a note). Tests: observe.test.ts, error-boundary.route.test.tsx, and two Settings route tests (sign out; copy diagnostics on FakeClipboard with a real BufferLogger, asserting item name, amount, email and display name are absent). Not done: AC #1's notifications toggle. PreferencesTemplate cannot draw its switch disabled (no prop), and a ui change is outside this layer. The switch is left off with no handler, so it is inert but looks live; the fix is a notificationsDisabled prop on the template, then TASK-1.29 wires it. Also: buffer is in memory only (no key-value port); the kitchen name on Settings is the 'Our kitchen' sample (no read of it exists) and the partner is 'your partner'; error messages are withheld wholesale because GrocsError does not exist yet. The Hermes rejection tracker still needs confirming on both phones in a dev build.
<!-- SECTION:NOTES:END -->
