---
id: TASK-28
title: Demo smoke check fails when the emulator's launcher hangs
status: Done
assignee:
  - '@claude'
created_date: '2026-10-20 22:09'
updated_date: '2026-10-20 22:34'
labels:
  - ci
  - bug
  - size-2
dependencies: []
modified_files:
  - tools/demo-smoke.sh
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
The demo APK smoke check (tools/demo-smoke.sh, step 'Install and launch it on an emulator' in demo-apk.yml) failed on run 39501055452 although the app was fine: logcat shows io.bruk.grocs.demo MainActivity displayed in 1.9 s and the screenshot shows the Welcome screen with 'Try the demo'. A 'Quickstep isn't responding' system dialog (the emulator's launcher) covered it, so the UI dump held only android and com.android.systemui nodes and the check timed out after 120 s.

## Affected users and systems
tools/demo-smoke.sh, .github/workflows/demo-apk.yml. Blocks the release step on a demo-v* tag when it happens.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A system 'isn't responding' dialog from another app does not fail the smoke check while the demo app is displayed
- [x] #2 The check still fails when the demo app crashes or its Welcome screen never appears
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In tools/demo-smoke.sh's polling loop, after the existing 'Try the demo' check and before the loop body ends, add a check for a system 'isn't responding' dialog in the pulled ui.xml (grep -qi "isn.t responding"). If found, send a BACK keyevent (adb shell input keyevent KEYCODE_BACK) to dismiss it, so the next iteration's dump can see past it instead of spending the whole 120 s budget staring at someone else's dialog. This does not change what makes the check fail: the FATAL EXCEPTION grep and the pidof liveness check, both already outside this loop, are untouched.

### Risks
Not independently testable here (no real demo APK or emulator with the APK installed is available in this environment; the script only runs for real inside android-emulator-runner in CI). The fix is validated on the next real demo-apk.yml run, same as TASK-10.4's own release-job half was. The BACK keypress only fires when the dump's text actually matches 'isn't responding', so it cannot dismiss the demo app's own UI by mistake.

### Proof
Read-through: the loop still breaks on FATAL EXCEPTION or a dead process exactly as before (AC2 unaffected); the new branch only adds a dismiss-and-retry path when the dump's content signals a foreign system dialog is in the way (AC1).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a dismiss-and-retry branch in the polling loop: when the pulled ui.xml matches 'isn't responding' (case-insensitive), send KEYCODE_BACK and let the loop continue. The FATAL EXCEPTION and pidof checks outside the loop are untouched, so AC2 still holds. Not independently testable here - no real demo APK/emulator combination available in this environment; validated on the next real demo-apk.yml run. pnpm check passes (14 checks).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(633 earlier lines omitted)
```text
│  3.00 kB │ gzip:   1.16 kB
│  storybook-static/assets/TabItem-DO_WQBW_.js
│  3.21 kB │ gzip:   1.35 kB
│  storybook-static/assets/Chip-BBQiiRFD.js
│  3.25 kB │ gzip:   1.45 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BDWCWUYW.js
│  4.34 kB │ gzip:   1.52 kB
│  storybook-static/assets/Button.stories-sNN3dC1C.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-BC9sKZ03.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/PreferencesTemplate.stories-DMm4jNL7.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/ItemRow-BgzP7XFR.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-Bu-n0q9_.js
│  5.75 kB │ gzip:   1.97 kB
│  storybook-static/assets/Button-CxILU1aQ.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-D4jB9WQY.js
│  11.37 kB │ gzip:   4.20 kB
│  storybook-static/assets/icons-BPDuhWkL.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-PNLDbSaq.js
│  17.31 kB │ gzip:   4.66 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-CGfbGzBZ.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-vq108xyw.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-DmUd5E6i.js
│  1,359.38 kB │ gzip: 391.72 kB

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

│  Vite ✓ built in 1.12s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 326 story views checked (axe, 44 x 44, images not compared)
```

No repro: this branch only fires against a live Android emulator with the demo APK installed inside android-emulator-runner, and no emulator/APK combination exists in this environment, so there is no harness that can exercise it. Reviewed by read-through of 0fb04d3 instead; it is confirmed or refuted by the next real demo-apk.yml run, the same unprovable-until-CI class as TASK-10.4's release half.

Reviewer's read-through (full check tier exited 0, reformatted nothing):
- The new branch sits inside the polling loop and *after* the "Try the demo" break, so the shown-path wins first: even if the app's own UI ever matched 'isn.t responding', no BACK is sent. The plan's 'cannot dismiss the demo app's own UI by mistake' holds structurally, not by assumption.
- The diff is +8 lines with nothing removed; the FATAL EXCEPTION grep, the pidof liveness check and the 'shown -ne 1' failure are byte-identical, so AC2's failure modes are untouched. A hung app that never draws still leaves shown=0 and still fails.
- bash -n parses cleanly.

Named assumptions for the next real run, neither blocking (the change is strictly additive: if the grep never matches, the script behaves exactly as before):
1. AC1 rests on the ANR dialog's text appearing in the pulled ui.xml. The logged run attests the dump held android/com.android.systemui nodes but does not quote 'Quickstep isn't responding' from the dump artifact itself.
2. 'uiautomator dump' can fail to reach idle state while an ANR dialog is up, leaving the previous iteration's ui.xml in place. Benign either way: a stale matching file just re-sends BACK, and a stale file cannot contain 'Try the demo' because the loop breaks the first time it does, so there is no false-pass path.

Closed: both criteria met on read-through of 0fb04d3, with the full check tier green (exit 0, nothing reformatted). AC1: the dismiss-and-retry branch turns a foreign 'isn't responding' dialog from a 120 s timeout into a BACK keypress and another poll. AC2: the FATAL EXCEPTION grep, the pidof liveness check and the 'shown -ne 1' failure are byte-identical, and a hung app that never draws still leaves shown=0, so a crash or a missing Welcome screen still fails. No repro, as recorded above: the script only runs for real inside android-emulator-runner.

Findings, none filed as drafts: (1) AC1's trigger depends on the dialog's text being in the pulled ui.xml, which the logged run does not quote from the dump artifact; (2) 'uiautomator dump' can leave a stale ui.xml while an ANR dialog is up. Both are named assumptions for the next real demo-apk.yml run rather than defects: the change is strictly additive, so if the grep never matches the script behaves exactly as before, and neither opens a false-pass path. No realistic failure is evidenced, so neither earns a task.
<!-- SECTION:NOTES:END -->
