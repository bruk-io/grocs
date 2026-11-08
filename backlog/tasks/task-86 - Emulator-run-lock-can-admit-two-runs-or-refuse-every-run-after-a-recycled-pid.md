---
id: TASK-86
title: 'Emulator run lock can admit two runs, or refuse every run after a recycled pid'
status: Done
assignee: []
created_date: '2026-11-08 19:54'
updated_date: '2026-11-08 20:10'
labels:
  - providers
  - size-1
  - finish-moved
dependencies: []
modified_files:
  - tools/emulator-run-lock.ts
  - tools/emulator-run-lock.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-85, tools/emulator-run-lock.ts. Each case was driven through the real acquire with an in-memory LockFs; a multi-process filesystem stress was not run. (1) writeFileSync with flag wx creates the file and then writes it, so a second run reading in between sees an empty file, Number('') is 0, and it removes the live holder's lock and takes over. Both runs proceed, which is what the guard exists to prevent. (2) Stale takeover is check-then-remove: B reads a dead holder, A removes and recreates, B then removes A's fresh lock. Both get ok. Parallel agent starts make this reachable after a crash. (3) After a crash, if the pid is reused by a live process, or by the new run itself, every run is refused until that process exits or someone deletes the file, and the refusal names neither LOCK_PATH nor that recovery. The lock stores only a pid, so it cannot tell a reused pid from a real holder. Unit tests use an atomic in-memory lock and cover none of this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Two runs starting together, on a free lock or a stale one, never both proceed, shown by a test that drives those interleavings
- [x] #2 A lock whose pid now belongs to another program, or to the run itself, does not block runs indefinitely
- [x] #3 The refusal names what holds the lock and how to find it
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Replace the file lock with a listening TCP port on 127.0.0.1:4498: listen is exclusive, and the kernel frees the port when the holder dies.
2. The refusal names the port, why the rule exists, and how to see the holder.

### Risks
- Something unrelated could hold port 4498; the refusal says how to find it, and it is outside the ports firebase.json uses.

### Proof
- Eight real processes starting together admit exactly one; a killed holder frees the lock at once; the live refusal against real emulators.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator. Eight-process test passed in 8 of 8 local runs. No repro: the race needs real concurrent timing on the unfixed lock, and that code no longer exists on this branch; the review that found it drove the interleavings by hand.

Correction, 2026-11-08: the note above saying the eight-process test 'passed in 8 of 8 local runs' was about a rename-based file lock and is withdrawn. That test then failed under pre-commit load, and working through it showed a real race: a run holding a stale read could rename a fresh lock aside, letting a third run in, so two runs both held it. The file lock was dropped for a listening port (see the plan). Finish moved: #3 asked the refusal to name 'the lock file and how to clear it', and there is no file or anything to clear now, so it names the port and how to see the holder.

Evidence for the port lock: pnpm test 2115 passed, lock tests included under that load; lock tests alone passed 3 of 3 runs; against real emulators a second run failed at once with 'Another emulator test run is using the emulators (it holds port 4498)', the first exited 0 with 51 tests passing, and the port was free afterwards; pnpm test:emulator 144 passed; pnpm check 16 passed; typecheck clean.

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

│  Vite ✓ built in 1.30s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 458 story views checked (axe, 44 x 44, images not compared)
```

No repro: the file lock this bug describes is not on this branch (7a64e4a adds tools/emulator-run-lock.ts as the port lock only), so its interleavings have no code to run against. Restated by the reviewer on its own line because the worker's own 'No repro:' sits mid-paragraph and board-check only reads it at the start of a line. The reason is the worker's; the reviewer checked that the old lock is absent, and did not reproduce the original race. What the reviewer drove is the port lock: 8 processes on a free port (committed test) and 8 started as a holder was SIGKILLed (ad-hoc probe, 5 rounds), exactly one admitted each time.

Review verdict: closed; all three criteria met. Full tier exited 0 and changed no files. #1: exactly one of 8 real processes admitted (committed test). A port has no stale state, so stale equals free; the committed tests cover crash-then-acquire and 8-on-free separately, and stale-plus-concurrent was only an ad-hoc probe (5 rounds, one winner each). #2: no pid is stored, so a reused pid cannot block. The nearest equivalent is an unrelated program on 4498, which refuses every run until it exits; the plan names this risk and the refusal gives lsof. #3: the refusal names the port and the lsof command. Finish move judged legitimate: the file is gone so 'how to clear it' has no meaning, and wording, finish-moved label and note landed together in 7a64e4a. It does weaken clear to find; 'wait for it to finish' plus lsof still give a way out. The original wording exists only in the note, since no earlier commit holds it. Attacks, all live: lock holder was the vitest main process, unchanged for the whole run of pnpm test:emulator (144 passed); forks do not hold it. A concurrent vitest run --project emulator was refused with exit 1 and the first run stayed green. Unref did not lose the lock early, and the port was free afterwards. SIGKILL of the main freed the port within 1s and its worker was gone by then. A detached child outliving a killed holder does not keep the port. Tests cannot touch 4498: the only uses are the constant and setup(), tests pass ephemeral ports and import only acquire. Findings, none filed, notes only because no repo code connects to 4498: (low) release waits on open connections: a client held on 4498 kept vitest alive to t+109 after 24s of tests, against t+37 without, and it exited only when the client left; a client that connects and leaves does no harm. (low) the refusal says 'another emulator test run' even when an unrelated program holds the port; lsof corrects it. (low) the worker's 'No repro:' was mid-paragraph so the gate could not read it; the reviewer restated it in a note above. Not covered: the lock guards only the vitest emulator project; tools/e2e.ts reseeds outside it (TASK-85 review noted the same class). Not tested on Linux.
<!-- SECTION:NOTES:END -->
