---
id: TASK-21
title: The /join screen shows the neutral code entry until a code is rejected
status: In Progress
assignee:
  - '@builder-app-small'
created_date: '2026-10-20 17:39'
updated_date: '2026-10-20 20:27'
labels:
  - size-1
  - layer-app
  - finish-moved
dependencies:
  - TASK-18
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-18 delivered InviteRetryTemplate attempt='first' (no inviter, errorMessage or onBack). apps/mobile/src/screens/JoinInviteScreen.tsx still passes inviter always and typechecks as a retry, so a first-time joiner from Welcome's 'Open it to join' still sees 'Code didn't work' and 'Back to my invite' before typing anything. Split from TASK-18 at acceptance as the app half; it was promised as its own size-1 task and was never filed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 JoinInviteScreen renders attempt='first' before any code is checked and switches to the retry state only after a rejection, keeping the typed code, shown by a route test
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/JoinInviteScreen.tsx: replace the final return (the single <InviteRetryTemplate inviter="your partner" ... /> element) with one that renders, when linked === null && error === undefined, <InviteRetryTemplate attempt="first" code={code} onCodeChange={setCode} checking={busy} onCheck={() => void join(code)} />, and otherwise the existing element exactly as it is now. Keep both in the same position so React keeps the field (same component type in the same slot).
2. apps/mobile/src/routes/kitchen.route.test.tsx: add a test 'opens /join with a neutral code entry, and says the code did not work only after a rejection': render ROUTES with await appOnFakes({ signedIn: true, kitchen: false }) at location '/join'; expect await screen.findByText('Enter your invite code'); expect screen.queryByText("Code didn't work") to be null; then change the textbox to 'NOPE-0000' and click the 'Check code' button; expect await screen.findByText("Code didn't work"). Change no other test.
3. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code (for example the retry title's exact text differs), stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by the orchestrator (Oct 20, 2026): the app half promised when DRAFT-12 was split, which TASK-18's review found had never been filed. Rule chosen: the neutral first-attempt state shows only when the screen was not opened from an invite link and no code has been rejected yet; a link-opened entry keeps the retry shape and its Back to my invite, unchanged.

Builder report (builder-app-small, Oct 20, 2026): Step 1 done. JoinInviteScreen renders InviteRetryTemplate attempt='first' (code, onCodeChange, checking, onCheck) when linked === null and no error has been set; after a rejection, or for a link-opened entry, the existing retry element is rendered unchanged in the same slot, so the field and focus are kept. Step 2 done: route test 'opens /join with a neutral code entry, and says the code did not work only after a rejection' added after the typed-code join test; no other test changed. Note: the test asserts the title switch only; the acceptance text also says the typed code is kept, which this test does not assert. Step 3 results: pnpm test 100 files / 1347 tests pass; pnpm typecheck exit 0; pnpm check (13 checks) passed; pnpm check:release and pnpm check:demo passed.

Added at the orchestrator's request (Oct 20, 2026): the test 'opens /join with a neutral code entry...' now also asserts the textbox still holds 'NOPE-0000' after the rejection, covering acceptance #1's typed-code promise. Kitchen route tests 18 pass; pnpm test 1348 pass.

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

|  Vite ✓ built in 5.57s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.4s of this 5.5s
|  build (80%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (35%, 1.9s, 822
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

Review (philosophy:reviewer, Oct 20, 2026): not closed. Full tier passed (recorded above) and pnpm check:demo passed. The change did exactly steps 1 and 2 plus the orchestrator-requested typed-code assertion (ed2a0df); link-opened behaviour is unchanged. Criterion #1 left unticked: it promises the typed code AND focus are kept, shown by a route test; the test asserts the title switch and the kept code but nothing about focus. Focus is doubtful in practice: InviteRetryTemplate passes disabled={checking} to the field, and disabling a focused input blurs it on web. Either the test asserts focus (and the screen restores it after the check), or the criterion's owner drops 'and focus' as a finish-moved change. Repro not recorded: restoring JoinInviteScreen.tsx from d5a37e6^ was denied by the reviewer's write guard; the orchestrator can restore it, run record-check TASK-21 --repro -- <the kitchen route test filtered to 'neutral code entry'>, and restore it. close-task refused on both points.

Repro at 5aa5b8df1bb4, test files: apps/mobile/src/routes/kitchen.route.test.tsx; command: `npx vitest run --project app apps/mobile/src/routes/kitchen.route.test.tsx -t 'neutral code entry'` exited 1

(476 earlier lines omitted)
```text
              [33mtabindex[39m=[32m"0"[39m
              [33mtype[39m=[32m"button"[39m
            [36m>[39m
              [36m<div[39m
                [33mclass[39m=[32m"css-text-146c3p1 r-fontFamily-n0uq4e r-fontWeight-1vr29t4 r-fontSize-ubezar r-lineHeight-rjixqe"[39m
                [33mdir[39m=[32m"auto"[39m
                [33mstyle[39m=[32m"color: rgb(255, 255, 255);"[39m
              [36m>[39m
                [0mCheck code[0m
              [36m</div>[39m
            [36m</button>[39m
            [36m<button[39m
              [33maria-busy[39m=[32m"false"[39m
              [33maria-label[39m=[32m"Back to my invite"[39m
              [33mclass[39m=[32m"css-view-g5y9jx r-cursor-1loqt21 r-touchAction-1otgn73 r-alignItems-1awozwy r-flexDirection-18u37iz r-gap-1cmwbt1 r-justifyContent-1777fci r-minWidth-1ps3wis r-borderRadius-1867qdf r-height-1ugchlj r-paddingInline-3pj75a r-backgroundColor-1niwhzg r-alignSelf-1pz39u2"[39m
              [33mrole[39m=[32m"button"[39m
              [33mtabindex[39m=[32m"0"[39m
              [33mtype[39m=[32m"button"[39m
            [36m>[39m
              [36m<div[39m
                [33mclass[39m=[32m"css-text-146c3p1 r-fontFamily-n0uq4e r-fontWeight-1vr29t4 r-fontSize-a023e6 r-lineHeight-hbpseb"[39m
                [33mdir[39m=[32m"auto"[39m
                [33mstyle[39m=[32m"color: rgb(31, 77, 51);"[39m
              [36m>[39m
                [0mBack to my invite[0m
              [36m</div>[39m
            [36m</button>[39m
          [36m</div>[39m
        [36m</div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"css-view-g5y9jx r-alignItems-1awozwy r-paddingBottom-qn3fzs r-paddingInline-u9wvl5"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"css-text-146c3p1 r-fontFamily-n0uq4e r-fontSize-n6v787 r-fontWeight-1kfrs79 r-lineHeight-14yzgew r-color-mjfs2f"[39m
            [33mdir[39m=[32m"auto"[39m
          [36m>[39m
            [0mNot expecting this? You can ignore it.[0m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</div>[39m
  [36m</div>[39m
[36m</body>[39m
 ❯ waitForWrapper node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ node_modules/@testing-library/dom/dist/query-helpers.js:86:33
 ❯ apps/mobile/src/routes/kitchen.route.test.tsx:113:25
    111|   it('opens /join with a neutral code entry, and says the code did not…
    112|     renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitc…
    113|     expect(await screen.findByText('Enter your invite code')).toBeTrut…
       |                         ^
    114|     expect(screen.queryByText("Code didn't work")).toBeNull();
    115|     fireEvent.change(screen.getByRole('textbox'), { target: { value: '…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 17 skipped (18)
   Start at  16:27:24
   Duration  5.97s (transform 2.50s, setup 192ms, import 4.06s, tests 1.17s, environment 370ms)
```

Finish line moved by the orchestrator (Oct 20, 2026): 'and focus' dropped from criterion 1. The TASK-21 review found nothing tests focus, and focus is likely lost anyway: InviteRetryTemplate disables the field while checking, which blurs it. Giving focus back needs a ui-layer change (the template has no way to refocus its field), so it is filed as its own draft, not built here. The repro was recorded by the orchestrator, because the reviewer's guard refuses restoring files: the new test fails against d5a37e6^'s JoinInviteScreen and passes now, with git diff -- apps empty afterwards.
<!-- SECTION:NOTES:END -->
