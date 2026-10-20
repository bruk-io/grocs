---
id: TASK-1.20.4
title: Kitchen setup shows the invite card unsent until the kitchen exists
status: Done
assignee:
  - '@builder-app-small'
created_date: '2026-10-20 12:42'
updated_date: '2026-10-20 20:08'
labels:
  - size-1
  - layer-app
  - finish-moved
dependencies:
  - TASK-19
parent_task_id: TASK-1.20
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved out of TASK-17 (its criterion 2) so the clipboard seam could merge for TASK-1.28. Once TASK-19 gives InviteCard and KitchenSetupTemplate an unsent state, KitchenSetupScreen uses it before CreateKitchen runs, so Share link and Copy code are disabled rather than dead. Numbered steps are written once TASK-19's API exists.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 After Start planning the card shows the real code with both buttons live, and the existing kitchen route tests pass unchanged
- [x] #2 Before a kitchen exists, kitchen setup shows the invite card with no code: Share link and Copy code hidden and a hint where the code will be, shown by a route test
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/KitchenSetupScreen.tsx: delete the line inviteCode={created?.inviteCode ?? '- - - -'} and move inviteCode into the spread so the type sees each shape whole: the created branch becomes { inviteCode: created.inviteCode, inviteStatus: ..., onShare: ..., onCopy: ..., onStart: ... } (its existing entries unchanged); the empty-name branch becomes { inviteCode: null }; the last branch becomes { inviteCode: null, onStart: () => void create() }.
2. apps/mobile/src/routes/kitchen.route.test.tsx: add a test 'hides Share link and Copy code until the kitchen exists': render ROUTES with await appOnFakes({ signedIn: true, kitchen: false }) at location '/'; expect await screen.findByText('Your code appears after Start planning.'); expect screen.queryByRole('button', { name: /Share link/ }) and screen.queryByRole('button', { name: 'Copy code' }) both to be null. Change no other test.
3. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 20, 2026 (orchestrator): TASK-19 is merged; its final API is inviteCode: string | null on KitchenSetupTemplate, where null hides Share link and Copy code, shows a hint, and refuses inviteStatus, onShare and onCopy at the type level.

Builder report (builder-app-small, Oct 20, 2026): Step 1 done. KitchenSetupScreen no longer passes inviteCode={created?.inviteCode ?? '- - - -'}; inviteCode moves into the spread: the created branch passes inviteCode: created.inviteCode with its existing status and handlers unchanged, the empty-name branch passes { inviteCode: null }, and the last branch { inviteCode: null, onStart }. Step 2 done: route test 'hides Share link and Copy code until the kitchen exists' added at the end of the creating-a-kitchen block; no other test changed. Step 3 results: pnpm test 100 files / 1348 tests pass (kitchen.route.test.tsx 18 tests, the 17 existing ones unchanged); pnpm typecheck exit 0; pnpm check (13 checks) passed; pnpm check:release and pnpm check:demo passed. Note on wording: acceptance #1 says Share link and Copy code are 'disabled'; InviteCard with a null code does not render those buttons at all (it shows the hint only), so the test asserts they are absent, which is what the TASK-19 API does. The acceptance wording may need to say 'hidden'.

Finish line moved by the orchestrator (Oct 20, 2026): criterion 1 said the buttons are disabled before a kitchen exists; Bruk chose 'hide them instead' for TASK-19, whose API this task uses, so the criterion now says hidden, with the hint.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(685 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-CXWYZHB2.js
|  5.75 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-C95kDzbw.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-BtBVEI8w.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-CWDGtaoA.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CICBh2O_.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-Qj2UL3QX.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-re48lt7C.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DB28BbHA.js
|  1,359.38 kB │ gzip: 391.73 kB

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

|  Vite ✓ built in 3.92s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 2.9s of this 3.9s
|  build (75%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (37%, 1.4s, 822
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
|  /home/claude/grocs/.claude/worktrees/agent-aa5250fbad27919ec/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 323 story views checked (axe, 44 x 44, 323 images compared)
```

Review (philosophy:reviewer, Oct 20, 2026): closed. Full tier passed (recorded above) and pnpm check:demo passed. 06948a4 did exactly steps 1 and 2: the '- - - -' placeholder is gone and inviteCode moved into the spread (created.inviteCode in the created branch, null in both others), so the template's union narrows and null refuses inviteStatus/onShare/onCopy at the type level. #1: the 17 existing kitchen route tests are untouched and pass; the created branch still passes the real code with both handlers. #2: the new route test finds the hint 'Your code appears after Start planning.' and asserts Share link and Copy code are absent. The finish-moved change is recorded properly: label, orchestrator note and its own commit (3f90485). Findings, low, filed nowhere: (a) 3f90485 also swapped the criteria's order, so the orchestrator's note and the builder's report call the reworded criterion '#1' while it is now #2; (b) the description still says the buttons are 'disabled' rather than hidden.
<!-- SECTION:NOTES:END -->
