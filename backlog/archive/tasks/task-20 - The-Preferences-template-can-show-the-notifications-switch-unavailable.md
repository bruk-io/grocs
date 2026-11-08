---
id: TASK-20
title: The Preferences template can show the notifications switch unavailable
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-20 17:34'
updated_date: '2026-10-20 19:24'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-1.28 builder. PreferencesTemplate has no way to draw its notifications switch disabled, so until push opt-in exists (TASK-1.29) Settings shows a switch that looks live and does nothing - the dead-control problem TASK-12, TASK-17 and TASK-19 removed elsewhere. TASK-1.28's criterion 1 waits on this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 PreferencesTemplate can show the notifications switch unavailable (disabled, with a short reason), as a state with its story and behaviour test, and its switch is never live without a handler
- [x] #2 Every existing baseline is unchanged and the new baselines are approved
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Make PreferencesTemplate's notifications switch a two-shape union (live: notificationsOn + required onNotificationsChange; unavailable: notificationsUnavailable reason string, disabled, off). Add 'unavailable' to PREFERENCESTEMPLATE_STATES, an Unavailable story, a behaviour test. Rest drawn unchanged. Approve new baselines via visual:update.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. PreferencesTemplate props are now NotificationsSwitch (live: notificationsOn + required onNotificationsChange | unavailable: notificationsUnavailable: string, switch drawn off and disabled, reason shown under the label) & the rest. Story Unavailable, test added, states list has 'unavailable'. Existing baselines unchanged; added templates-preferences--unavailable{,--fold-inner,--fold-outer}.png + manifest.json. pnpm check, typecheck, test (1335 passed), visual (318 compared) all pass.

Baselines approved by @bruk on Oct 20, 2026 ('Approve'), after seeing templates-preferences--unavailable.png. The visual baselines workflow (run 39472613507, on 8e1aa5a pushed as task-20-ui) wrote 319 files byte-identical to this branch's packages/ui/visual-baselines.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(682 earlier lines omitted)
```text
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-gFz3hklW.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-DiojW5oa.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-DdFL_gVs.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CrlvwgmA.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-yQdKDBEe.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BIfhJiro.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-DxeodYSS.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-Dmk3Wn4F.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-BM4CwDEn.js
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

|  Vite ✓ built in 6.64s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.3s of this 6.5s
|  build (83%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (58%, 3.7s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (36%, 2.3s, 822
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a2bc7d4c66415de97/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 318 story views checked (axe, 44 x 44, 318 images compared)
```

Review (philosophy:reviewer): closed. Full tier exit 0 (check, typecheck incl. apps/mobile, tests, emulator, visual 318 compared). #1: NotificationsSwitch union makes live require onNotificationsChange and refuses it in the unavailable shape (never); Unavailable story + behaviour test assert aria-disabled, aria-checked false after click, reason 'Coming soon' shown. #2: diff vs 2b9ecf6 only adds the three unavailable PNGs and their manifest lines; rest* hashes untouched; workflow run 39472613507 identity and Bruk's approval recorded in notes. Minor, not filed: the behaviour test proves inertness by aria-checked staying false, not with a spy (the unavailable shape has no handler to spy). Follow-up already planned: TASK-1.28 moves SettingsScreen to the unavailable shape.
<!-- SECTION:NOTES:END -->
