---
id: TASK-1.28
title: Settings and diagnostics
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-20 20:21'
labels:
  - size-2
  - slice
  - finish-moved
milestone: m-3
dependencies:
  - TASK-20
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Waits on the skeleton. Cites R35.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Settings holds the notifications toggle, copy diagnostics and sign out
- [ ] #2 Copy diagnostics copies the recent log records from the on-phone buffer, with no personal content
- [x] #3 Uncaught errors, unhandled rejections, render errors and screen changes are logged by handlers installed once at app start (R33)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Finish moved on 2026-10-18, right after acceptance and before work started: added the R33 criterion, which no task cited.

Plan (builder-app, app layer only). 1) apps/mobile/src/composition/observe.ts: installObservers (once; ErrorUtils global handler keeping the previous one; Hermes rejection tracker behind a HermesInternal guard; one app-<id> correlation id), observer() for the layout's ErrorBoundary, routePattern(). Error records carry name/code and source only, never the message. 2) diagnostics.ts builds the header line (version, platform, build) + BufferLogger.dump(); NativeApp.diagnostics becomes non-null (dev/demo copy the header plus a note). Native installs observers before the first render. 3) _layout.tsx: ErrorBoundary with retry, useSegments effect logging the route pattern. 4) SettingsScreen: real session user, sign out via app.signOut then Welcome, Copy diagnostics via app.copyText. 5) Notifications toggle: PreferencesTemplate has no disabled prop for its switch, so disabling needs a ui change (stop and tell). I leave onNotificationsChange unset, so the switch is off and inert, and report it. 6) Tests: observe unit tests, settings route tests on FakeClipboard with a real BufferLogger (no item name, no email in the copy), ErrorBoundary test.

Report (builder-app). Built: observe.ts (installObservers once from createNativeApp; ErrorUtils handler keeps the previous one; Hermes tracker behind a HermesInternal guard; one app-<id> correlation id; error records carry source, name, code, route, never the message or a pathname), diagnostics.ts (header 'grocs diagnostics - version, platform, build' + BufferLogger.dump()), root ErrorBoundary with retry and a useSegments route-pattern effect in app/_layout.tsx, SettingsScreen on the real session with working sign out and Copy diagnostics via app.copyText. NativeApp.diagnostics is now non-null (dev and demo copy the header plus a note). Tests: observe.test.ts, error-boundary.route.test.tsx, and two Settings route tests (sign out; copy diagnostics on FakeClipboard with a real BufferLogger, asserting item name, amount, email and display name are absent). Not done: AC #1's notifications toggle. PreferencesTemplate cannot draw its switch disabled (no prop), and a ui change is outside this layer. The switch is left off with no handler, so it is inert but looks live; the fix is a notificationsDisabled prop on the template, then TASK-1.29 wires it. Also: buffer is in memory only (no key-value port); the kitchen name on Settings is the 'Our kitchen' sample (no read of it exists) and the partner is 'your partner'; error messages are withheld wholesale because GrocsError does not exist yet. The Hermes rejection tracker still needs confirming on both phones in a dev build.

Follow-up (builder-app, after TASK-20 merged). The notifications switch is now drawn off and disabled: SettingsScreen passes notificationsUnavailable="Coming soon" and no longer passes notificationsOn or onNotificationsChange, until push opt-in (TASK-1.29) wires the real toggle. New Settings route test checks the switch is disabled and unchecked and that 'Coming soon' shows. Merged main (one conflict, the task file's updated_date, resolved to the later date). The merge commit needed the screen change to typecheck, so the fix is in the same commit. This supersedes the 'Not done' note on AC #1's toggle above. Criteria left unticked for the reviewer.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(712 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-Bu-n0q9_.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-CxILU1aQ.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-D4jB9WQY.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-BPDuhWkL.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-PNLDbSaq.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-CGfbGzBZ.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-vq108xyw.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DmUd5E6i.js
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

|  Vite ✓ built in 4.08s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.0s of this 4.0s
|  build (73%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (33%, 1.3s, 822
|  calls)
|  Additional callback time came from the callbacks below and from
|  callbacks under 1s.
|  1 callback is listed without a time. Its calls overlapped, so the time
|  inside one call includes work from other calls. To find its cost,
|  profile the build with `node --cpu-prof`:
|  - plugin vite:css transform (2 calls)
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a1fa31dd9258f9d8c/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 326 story views checked (axe, 44 x 44, 326 images compared)
```

Review (philosophy:reviewer, Oct 20, 2026): not closed, on criterion #2 only. Full tier passed (recorded above) and pnpm check:demo passed. #1 met: route tests show sign out ends the session and shows Welcome, Copy diagnostics copies through app.copyText, and the switch is disabled, unchecked, with 'Coming soon' (TASK-20's API; the change rode in merge 863fca4 because the merged template refused the old props, which is explained in the notes). #3 met: observe.ts installs once from createNativeApp, keeps and calls the previous ErrorUtils handler, guards the Hermes tracker, the root ErrorBoundary logs source render with the route and retries, and the layout logs the useSegments pattern, never a pathname; one app-<id> correlation id. Unit and route tests drive these with fakes; the on-phone confirmation decision-8 asks for moves to DRAFT-14 (assigned to Bruk), as TASK-1.37.7 did for fonts. #2 not met: withholding every message in observe.ts is sound and stricter than decision-8 (it loses only our own id-only messages until GrocsError exists), but the buffer also holds instrumentPort's records, and describeError there still copies SDK error messages (200 chars) into the copy. The copy test covers only a successful AddItem, so that path is untested. Filed as DRAFT-13. Demo build leaving observer() a no-op is right: the demo has no on-phone buffer to write to and its diagnostics say nothing is logged; the ErrorBoundary still shows retry. Finding filed in DRAFT-14: React Native installs its own Hermes rejection tracker in __DEV__, which ours replaces, so dev builds lose the unhandled-rejection warning. Lower, filed nowhere: BufferLogger is still one 500-record ring in memory (decision-8's two rings and persistence wait on the key-value port), and Settings shows sample kitchen and partner names.
<!-- SECTION:NOTES:END -->
