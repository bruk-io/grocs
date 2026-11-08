---
id: TASK-17
title: Copy code on kitchen setup does nothing
status: Done
assignee:
  - '@builder-app'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 16:07'
labels:
  - size-2
  - layer-app
  - finish-moved
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.20.2 review. KitchenSetupScreen passes onShare but no onCopy, so InviteCard renders 'Copy code' as a full-size button that does nothing once a kitchen is made (no clipboard module is installed; the builder noted it). Same class of problem as TASK-12: a control that looks live but is dead, and the code is the one thing a partner needs. Before the kitchen exists, Share link and Copy code are both rendered with no handler beside a placeholder code '- - - -'.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Copy code puts the invite code on the clipboard, shown by a route test on a fake clipboard
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Resized to 2 at acceptance: it adds expo-clipboard, a native module, and a clipboard seam on the app composition that route tests can fake. decision-8 already names expo-clipboard for the diagnostics copy (TASK-1.28), so this lays the shared piece.

Oct 20, 2026 (orchestrator): the builder stopped before editing because criterion 2 needs a ui change (TASK-19). Split by order, not by task: this task builds criterion 1 now (expo-clipboard, the copyText seam, Copy code once a kitchen exists, a route test on a fake clipboard) and comes back for criterion 2's route test once TASK-19 merges.

Plan (builder-app, criterion 1 only): add expo-clipboard ~58.0.3 to apps/mobile (lockfile diff checked for scope and build scripts); App.copyText(text): Promise<void> required on AppOptions, passed through composeFirebaseApp and composeDemoApp; native.ts and demo/index.ts wire expo-clipboard setStringAsync; FakeClipboard in apps/mobile/testing, passed by appOnFakes; KitchenSetupScreen passes onCopy once a kitchen exists; route test in kitchen.route.test.tsx. Criterion 2 untouched.

Criterion 1 built (builder-app): expo-clipboard ~58.0.3 added (lockfile diff is the one package, no build script, allowBuilds untouched). App.copyText is a required seam on AppOptions, composeFirebaseApp and composeDemoApp; native.ts and the demo entry wire setStringAsync. FakeClipboard in apps/mobile/testing, returned by appOnFakes as .clipboard. KitchenSetupScreen passes onCopy once a kitchen exists. Route test 'puts the invite code on the clipboard when Copy code is pressed' in kitchen.route.test.tsx. Ran: pnpm check, typecheck, test (1332 passed), check:release, check:demo, all clean. Criterion 1 left unticked for the reviewer; criterion 2 waits on TASK-19; task stays In Progress.

Finish line moved by the orchestrator (Oct 20, 2026): criterion 2 (Share link and Copy code disabled or hidden before a kitchen exists) moved to TASK-20, which follows TASK-19's ui change. Reason: the clipboard seam built here is what TASK-1.28's diagnostics copy needs, and holding it for an unrelated ui change would block that. Dependency on TASK-19 dropped with it.

Correction: the moved criterion is TASK-1.20.4 (filed under TASK-1.20), not TASK-20.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(685 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-DT2E49m-.js
|  5.75 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-5YEl73Jj.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-Cu--Utzi.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-Bv4azUGw.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-jjCZAg1S.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-DbzRAt0n.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CMbDcjBB.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-HGbYrCHh.js
|  1,359.38 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 9.21s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 6.6s of this 9.1s
|  build (72%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin treat-js-files-as-jsx transform (22%, 2.0s, 822 calls)
|  - plugin storybook:react-docgen-plugin transform (22%, 2.0s, 822
|  calls)
|  - plugin vite:css transform (19%, 1.7s, 2 calls)
|  - plugin storybook:project-annotations-plugin load (14%, 1.3s, 821
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a280f3d4ff0606ed1/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 315 story views checked (axe, 44 x 44, 315 images compared)
```

Review (philosophy:reviewer, Oct 20 2026): NOT CLOSED - close-task refused: a bug needs a recorded repro (record-check TASK-17 --repro -- <failing test>) and none was recorded. Everything else passes, and #1 is ticked. Evidence for #1: kitchen.route.test.tsx 'puts the invite code on the clipboard when Copy code is pressed' asserts FakeClipboard.copied equals the displayed code. Full tier (check, typecheck, test, test:emulator incl. two-client with its FakeClipboard fixture, check:release, storybook, visual) exited 0 in one pass with no re-runs; check:demo exit 0; the checks reformatted nothing. expo-clipboard 58.0.3 published 2026-10-01 (past minimumReleaseAge 1440), no install script, lockfile diff is that package only, allowBuilds untouched; CI=true pnpm install --frozen-lockfile (pnpm 11.28.6) exit 0. copyText is required on AppOptions, FirebaseAppOptions and DemoOptions, and setStringAsync is wired in native.ts and demo/index.ts. FakeClipboard is an app seam in apps/mobile/testing. Finish-line move to TASK-1.20.4 is sound and recorded (c210396 + 7dc6b40 on main); nit: the note first says TASK-20, then corrects it. To close: run the new route test against ba96480's parent with KitchenSetupScreen's onCopy line removed, record it as a failing --repro, then re-run close-task. Writing 'No repro:' would be false, because this bug can have one.

Repro at c21039627926, test files: apps/mobile/src/routes/kitchen.route.test.tsx; command: `npx vitest run --project app apps/mobile/src/routes/kitchen.route.test.tsx -t 'puts the invite code on the clipboard'` exited 1

(153 earlier lines omitted)
```text
                              [33mfill[39m=[32m"#EFE6CF"[39m
                              [33mr[39m=[32m"5"[39m
                              [33mstroke[39m=[32m"#D8CDB4"[39m
                              [33mstroke-width[39m=[32m"1.5"[39m
                            [36m/>[39m
                          [36m</g>[39m
                          [36m<g>[39m
                            [36m<path[39m
                              [33md[39m=[32m"M44 56c2-13 4-26 7-39"[39m
                              [33mfill[39m=[32m"none"[39m
                              [33mstroke[39m=[32m"#D8CDB4"[39m
                              [33mstroke-linecap[39m=[32m"round"[39m
                              [33mstroke-width[39m=[32m"7"[39m
                            [36m/>[39m
                            [36m<path[39m
                              [33md[39m=[32m"M44 56c2-13 4-26 7-39"[39m
                              [33mfill[39m=[32m"none"[39m
                              [33mstroke[39m=[32m"#F7F2E6"[39m
                              [33mstroke-linecap[39m=[32m"round"[39m
                              [33mstroke-width[39m=[32m"4.5"[39m
                            [36m/>[39m
                            [36m<circle[39m
                              [33mcx[39m=[32m"51"[39m
                              [33mcy[39m=[32m"15"[39m
                              [33mfill[39m=[32m"#EFE6CF"[39m
                              [33mr[39m=[32m"5"[39m
                              [33mstroke[39m=[32m"#D8CDB4"[39m
                              [33mstroke-width[39m=[32m"1.5"[39m
                            [36m/>[39m
                          [36m</g>[39m
                          [36m<g>[39m
                            [36m<path[39m
                      ...

- Expected
+ Received

- [
-   "WINTER-8008",
- ]
+ []

 ❯ apps/mobile/src/routes/kitchen.route.test.tsx:73:54
     71|     const code = (await screen.findByText(/^[A-Z]+-\d{4}$/)).textConte…
     72|     fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
     73|     await waitFor(() => expect(app.clipboard.copied).toEqual([code]));
       |                                                      ^
     74|   });
     75|
 ❯ runWithExpensiveErrorDiagnosticsDisabled node_modules/@testing-library/dom/dist/config.js:47:12
 ❯ checkCallback node_modules/@testing-library/dom/dist/wait-for.js:124:77
 ❯ Timeout.checkRealTimersCallback node_modules/@testing-library/dom/dist/wait-for.js:118:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 skipped (16)
   Start at  12:06:16
   Duration  22.63s (transform 6.47s, setup 1.74s, import 14.04s, tests 2.05s, environment 4.10s)
```

Closed by philosophy:reviewer. Repro verified: recorded failure shows route test 'puts the invite code on the clipboard when Copy code is pressed' failing (clipboard [] vs [code]) with KitchenSetupScreen's onCopy removed; code restored (git diff -- apps empty, onCopy present at KitchenSetupScreen.tsx:53) and the test re-run passes. Criterion 1 ticked earlier with a full-tier pass; criterion 2 moved to TASK-1.20.4 (finish-moved). No new findings.

From the TASK-19 review (Oct 20, 2026): HouseholdScreen (apps/mobile/src/screens/HouseholdScreen.tsx, the /household sample-data route) passes inviteCode='MOREL-24' and a waiting status but no onShare/onCopy, so since TASK-19 it shows Share link and Copy code disabled (before, they looked live and did nothing). Not dead, so acceptable, but a 'waiting' sample with both buttons greyed reads oddly. When this task adds the clipboard seam, give HouseholdScreen onCopy (and a no-op-free onShare) or decide it should pass inviteCode={null}. Folded here rather than a separate task: same card, same layer.
<!-- SECTION:NOTES:END -->
