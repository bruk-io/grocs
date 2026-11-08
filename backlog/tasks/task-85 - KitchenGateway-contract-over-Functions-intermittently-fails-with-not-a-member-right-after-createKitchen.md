---
id: TASK-85
title: >-
  KitchenGateway contract over Functions intermittently fails with not a member
  right after createKitchen
status: Done
assignee: []
created_date: '2026-11-08 18:07'
updated_date: '2026-11-08 19:54'
labels:
  - providers
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
pnpm test:emulator failed once during the TASK-81 review (run started 13:00:04, 2026-11-08): in packages/providers-firebase/src/kitchen-gateway.emulator.test.ts, 'a cancelled invite is no longer offered and cannot be used' and 'refuses an invite once both members are in, so a third person never gets in (R3)' failed, 2 of 144 tests, with FirebaseError: not a member of this kitchen [403]. In each test the only earlier gateway calls that could have raised it are createKitchen, then inviteByEmail by the same owner. KitchenStore raises NotAMemberError when the kitchen document is absent or the caller is not a member, so one of those was true. Not reproduced: 8 consecutive project runs passed afterwards (2, then 6, each set on one emulator instance). The failing run came straight after pnpm check, typecheck and pnpm test in the full check chain; the passing runs were standalone, so load or Functions-emulator cold start is untested. Ruled out: file overlap, a timed run showed zero overlapping test files. Not cross-run state: the run was on a freshly started instance. Cause unknown. This matters because the failure turns the reviewer's full check red and stops the chain before check:release, build-storybook and visual. It also carries the determinism half of archived TASK-50 (criterion 2), which the fixed stranger uid change did not prove.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The cause of the intermittent 403 is identified and recorded
- [x] #2 pnpm test:emulator passes repeatedly when run straight after pnpm test in the full check chain
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-08, cause found. firestore.rules.test.ts calls clearFirestore in beforeEach, which wipes the whole demo-grocs project. fileParallelism: false serialises files inside one vitest run only, not across two. During TASK-81's review several reviewers ran the emulator suite at once, and one ran it directly against another's live emulators (15, 12, then 8 failures with a changing set). Deliberate repro: a loop deleting the demo project's documents while kitchen-gateway.emulator.test.ts runs gives 'not a member of this kitchen [403]' across many tests, because KitchenStore raises NotAMemberError when the kitchen document is gone. Load ruled out: pnpm test && pnpm test:emulator passed 5 of 5 straight through on a quiet machine, 144 tests each. The timestamps cannot name which process did the wiping in the original run, so this is the confirmed mechanism with contention present in that window, not a captured trace. Fix: a second emulator-project run now fails at once with the reason instead of wiping the first.

Guard: tools/emulator-run-lock.ts, set as the emulator project's globalSetup. Live proof on one emulator instance: while a first run held the lock, a second run failed at once with 'Another emulator test run (process 64139) is using the emulators...'; the first run exited 0 with 51 tests passing; the lock file was gone afterwards. pnpm test 2119 passed and takes no lock; pnpm test:emulator 144 passed; pnpm check 16 passed; typecheck clean. Soak before the guard: pnpm test && pnpm test:emulator passed 5 of 5 in a row.

No repro: the failure needs two concurrent vitest processes against one emulator, so no committed test can fail on the unfixed tree. The deliberate repro was a script outside the repo, a loop deleting the demo project's documents during kitchen-gateway.emulator.test.ts, which gave the same 'not a member of this kitchen [403]' across many tests.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(815 earlier lines omitted)
```text
│  3.73 kB │ gzip:   1.49 kB
│  storybook-static/assets/KitchenSetupTemplate.stories-DNMss1pw.js
│  4.34 kB │ gzip:   1.73 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BhqMxZMn.js
│  4.45 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Btl_3CFU.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/ItemRow-DvUMp8hC.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/PreferencesTemplate.stories-D5Odmrfs.js
│  5.30 kB │ gzip:   2.04 kB
│  storybook-static/assets/TextField-BnPWFEqF.js
│  5.35 kB │ gzip:   2.03 kB
│  storybook-static/assets/MealFormTemplate.stories-hbL71utF.js
│  6.26 kB │ gzip:   2.11 kB
│  storybook-static/assets/Button-BoEyW2D8.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-B6FC8Y0H.js
│  9.46 kB │ gzip:   3.16 kB
│  storybook-static/assets/Mascot-9qzfYchL.js
│  12.29 kB │ gzip:   4.47 kB
│  storybook-static/assets/icons-D9-RnOgP.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-ksyHI9MX.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-Bk-jiIm0.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-C68uENE-.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-COUQCjPE.js
│  1,361.35 kB │ gzip: 392.25 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.33s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 458 story views checked (axe, 44 x 44, images not compared)
```

Review verdict: closed; both criteria met. #1: the notes understate the evidence. Logs from the TASK-81 review period (session task outputs, a50187c and ae0c445) show the failing run (start 13:00:04, 19.92s) on the emulators held by agent a50187c, while agent ae0c445 started vitest run --project emulator directly against 127.0.0.1:8080 at 13:00:11, returning at 13:00:24 with 8 failures of its own. That run includes firestore.rules.test.ts, the only clearFirestore caller in the repo, so the concurrent wiper is named. The description's 'not cross-run state, freshly started instance' was wrong: the instance was fresh but shared. Per-file offsets from a separate timed run (rules at about +10s, kitchen-gateway from +11s) fit but are corroboration only; no per-request trace exists, and the original run's files were not timed. Also, the description says only createKitchen and inviteByEmail could raise the 403, but cancelInvite and the later inviteByEmail calls in those tests can too; a wipe explains those as well. #2: record-check full chain exited 0 and changed no files; then 10 of 10 pnpm test followed by pnpm test:emulator rounds, 144 tests each, on the guarded tree, with the lock gone afterwards. Findings: (medium) the lock can admit two runs through the empty-file read or stale-takeover race, and a recycled pid after a crash refuses every run with no recovery named in the message: one draft filed, not blocking since neither criterion covers it. Crash with a dead pid is handled correctly by takeover. (low, notes only) LOCK_PATH follows TMPDIR, so a process with a different TMPDIR escapes the lock. (low, notes only) a second pnpm test:emulator already fails on 'port taken' before vitest, so the guard's real target is a direct vitest run against live emulators; a bypass outside the vitest emulator project is not covered, though no other repo code calls clearFirestore. Not tested: a multi-process filesystem stress of the lock (the review hook refuses writing the probe); races were driven in memory through the real acquire. The draft needs filing on main by the orchestrator.
<!-- SECTION:NOTES:END -->
