---
id: TASK-1.28.1
title: 'Port error records withhold SDK messages, so Copy diagnostics carries none'
status: Done
assignee:
  - '@builder-application-small'
created_date: '2026-10-20 20:31'
updated_date: '2026-10-20 20:59'
labels:
  - size-1
  - layer-application
dependencies: []
parent_task_id: TASK-1.28
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-1.28. packages/application/src/instrumentation/instrument.ts describeError copies error.message (cut to 200 characters), and String(error) for non-Error values, into every failed port call's record, and those records sit in the release BufferLogger that Copy diagnostics copies. redact() matches keys and shapes, not free text, so an SDK or Firebase message quoting document data (an item name, an email) reaches the clipboard. decision-8: keep name and code, keep message only for GrocsError, withhold the rest. GrocsError does not exist yet, so every message is withheld until it does. The diagnostics copy is built from these records, so a test on the record covers it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 describeError keeps name and code and withholds every message, Error or not, until GrocsError exists, per decision-8
- [x] #2 A test fails a port call with an Error whose message holds an item name and a person's name, and neither appears in the logged record
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. packages/application/src/instrumentation/instrument.ts, describeError: for an Error return { name: error.name, ...(code), message: '[sdk message withheld]' } (keep the code lines as they are); for a non-Error return { name: 'NonError', message: '[value withheld]' }. Add a one-line comment above the function: messages are withheld until GrocsError exists (decision-8), because SDK messages can quote document data and these records reach Copy diagnostics.
2. packages/application/src/instrumentation/instrument.test.ts: add a test 'withholds a failed call's message, so no data it quotes reaches the log', set up the way the file's existing tests set up a port and capture logger records: a port method that rejects with new Error('permission denied reading Zucchini for Sam'); after the call settles, expect JSON.stringify of the captured records not to contain 'Zucchini' and not to contain 'Sam', and the failed record's error.message to be '[sdk message withheld]'.
3. If an existing test in that file expects a copied message text, change only that expected value to '[sdk message withheld]' (or '[value withheld]') and say so in your report; delete no test.
4. Run pnpm test, pnpm check and pnpm typecheck. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Report (builder-application-small): describeError now keeps name and code for an Error and withholds its message as '[sdk message withheld]'; a non-Error value gives { name: 'NonError', message: '[value withheld]' }. A one-line comment above the function cites decision-8. Step 2: added test 'withholds a failed call's message, so no data it quotes reaches the log' (a shop port rejecting with 'permission denied reading Zucchini for Sam'; asserts the JSON of the records has neither 'Zucchini' nor 'Sam', and the error message is '[sdk message withheld]'). Step 3: two existing expectations in the 'logs and rethrows' test changed from 'sync boom' and 'async boom' to '[sdk message withheld]'; no test deleted or skipped. Step 4: pnpm test passed (100 files, 1350 tests); pnpm check passed (13 checks); pnpm -s typecheck passed. No step failed to fit the code. Acceptance criteria left unchecked for the reviewer.

Repro at 472510772a70, test files: packages/application/src/instrumentation/instrument.test.ts; command: `npx vitest run --project unit packages/application/src/instrumentation/instrument.test.ts -t 'withholds a failed call'` exited 1

```text

 RUN  v4.1.12 /home/claude/grocs/.claude/worktrees/agent-a94518d944c62f37d

 ❯ |unit| packages/application/src/instrumentation/instrument.test.ts (5 tests | 1 failed | 4 skipped) 12ms
     × withholds a failed call's message, so no data it quotes reaches the log 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/application/src/instrumentation/instrument.test.ts > instrumentPort (R31) > withholds a failed call's message, so no data it quotes reaches the log
AssertionError: expected '[{"timestamp":1792411200000,"severity…' not to contain 'Zucchini'

Expected: "Zucchini"
Received: "[{"timestamp":1792411200000,"severity":"error","message":"shop.readItem failed","attributes":{"port":"shop","method":"readItem","durationMs":0,"outcome":"error","appVersion":"1.2.3","platform":"ios","kitchenRole":"owner","error":{"name":"Error","message":"permission denied reading Zucchini for Sam"}},"correlationId":"corr-1"}]"

 ❯ packages/application/src/instrumentation/instrument.test.ts:72:24
     70|     await expect(shop.readItem()).rejects.toThrow('permission denied r…
     71|     const logged = JSON.stringify(logger.records());
     72|     expect(logged).not.toContain('Zucchini');
       |                        ^
     73|     expect(logged).not.toContain('Sam');
     74|     expect(logger.records()[0]?.attributes['error']).toMatchObject({ m…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 skipped (5)
   Start at  16:45:53
   Duration  377ms (transform 155ms, setup 0ms, import 199ms, tests 12ms, environment 0ms)
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(680 earlier lines omitted)
```text
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/PreferencesTemplate.stories-DMm4jNL7.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-BgzP7XFR.js
|  5.19 kB │ gzip:   1.99 kB
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

|  Vite ✓ built in 4.02s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 2.9s of this 4.0s
|  build (73%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 1.4s, 822
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a94518d944c62f37d/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 326 story views checked (axe, 44 x 44, 326 images compared)
```

Review (philosophy:reviewer): closed. The diff in 4725107 is exactly the four steps. Step 1: describeError keeps name and code and withholds every message ('[sdk message withheld]' for an Error, '[value withheld]' for a non-Error), with the decision-8 comment. Step 2: the new test rejects with 'permission denied reading Zucchini for Sam' and asserts neither word is in the JSON of the records. Step 3: the two expectations that changed from 'sync boom'/'async boom' to the marker are a legitimate update, not a weakening. The test still asserts severity error, outcome error, name Error, and that both calls rethrow with the original text, so the thrown error keeps its message and only the log record loses it. Step 4: covered by the full tier. Repro: 27d6078 changes only this task file, and its recorded run shows the new test failing on the old describeError output (the message copied into the record). Full tier (record-check above) exit 0: checks 13/13, typecheck, unit 1350/1350, emulator 70/70, release bundles clean, storybook, visual 326 views; it changed no source files. AC1 and AC2 met. Other places that copy messages: none feed the logger. logging-middleware logs errorCode only. The dispatcher's internal-error message goes into the CommandResult, not a record. The firestore-sync-store messages get thrown and then withheld by describeError. The screen messages (WelcomeScreen, GroceriesScreen) go into UI state. The global observer on TASK-1.28's branch (apps/mobile/src/composition/observe.ts) already withholds as '[message withheld]'. No draft filed. Low: there are three different withheld markers ('[sdk message withheld]', '[value withheld]', '[message withheld]'). Worth aligning when GrocsError lands, but not filed.
<!-- SECTION:NOTES:END -->
