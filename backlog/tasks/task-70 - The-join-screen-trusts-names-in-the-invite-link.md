---
id: TASK-70
title: The join screen trusts names in the invite link
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 00:14'
updated_date: '2026-11-07 01:06'
labels:
  - size-2
  - app
  - providers
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-68's review, Bruk 2026-11-06: 'close it off'. TASK-68 put the sender's name and kitchen in the invite link (from=, kitchen=) and the join screen shows them, so anyone who edits or forges a link can make the screen name a sender and kitchen that are not real. Chosen fix: the join screen asks the server for the invite's real kitchen and owner by code, and never reads names from the link. The lookup requires sign-in, like every kitchen function, so names are not exposed to someone guessing codes; signed out, the screen names nobody. Also: KitchenSetupScreen's share message names the kitchen but not the sender (TASK-68 review finding 2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The join screen never shows a name taken from the link
- [x] #2 A signed-in person opening a valid invite sees the real sender and kitchen, from the server
- [x] #3 An invalid or used code, or a signed-out person, sees no names
- [x] #4 The share message from kitchen setup names the sender, as Household's does
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06 evidence (branch fix/invite-preview). Full check ('full' in .claude/checks.json) exit 0: 16 checks; 138/138 unit files (1750 tests); test:emulator 8/8 files, 108 tests incl. the two new previewInvite contract cases against the server store and the Firebase client through the Functions emulator; check:release clean; 425 story views. Route tests: a signed-in joiner opening /join?code=<real>&from=Mallory&kitchen=Fake%20kitchen sees 'Bruk invited you to' and 'Our place' from the server, and no Mallory or Fake kitchen; signed out the same link names nobody. invite-message tests: the link carries only code=; the share message names sender and kitchen, including from kitchen setup. Devices: pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed'. The first run failed add-meal and household-join on iOS: the keyboard covers the action button (TASK-73), so the flows now submit with the return key. Also fixed: demo.route.test waits for Settings' kitchen name, which loads asynchronously since TASK-63 and lost the race under a loaded run.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(730 earlier lines omitted)
```text
│  3.74 kB │ gzip:   1.48 kB
│  storybook-static/assets/MealFormTemplate.stories-BG8b73_v.js
│  4.32 kB │ gzip:   1.57 kB
│  storybook-static/assets/ItemPickerTemplate.stories-CAExloqx.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Dh_mSv8s.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/HouseholdTemplate.stories-pGFLPl7n.js
│  4.53 kB │ gzip:   1.63 kB
│  storybook-static/assets/TextField-DulAHfAd.js
│  4.98 kB │ gzip:   1.91 kB
│  storybook-static/assets/PreferencesTemplate.stories-CvDKj7l8.js
│  5.11 kB │ gzip:   1.94 kB
│  storybook-static/assets/ItemRow-Br0EeN7C.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/Button-BNNiZ5tn.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-D4f2WHuK.js
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-BGA0f5dQ.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-eB6EtNXc.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-CZopag8i.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-oFZGZ70h.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Bol10P1r.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-BF62yNUn.js
│  1,360.87 kB │ gzip: 392.12 kB

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

│  Vite ✓ built in 1.54s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/review-70/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 425 story views checked (axe, 44 x 44, images not compared)
```

No repro: no failing run was recorded before the fix, and a reviewer cannot put the new forged-link route test on top of the old screen without editing files. The bug shows in the old code: at 371c9da~1, JoinInviteScreen rendered params.from and params.kitchen, and its route test checked for names taken from the link.

Review (philosophy:reviewer): closed. Full check rerun on 371c9da, exit 0. AC1-4 met: link names ignored (forged-link route test), server names when signed in (route + contract via Functions emulator), null for unknown/used/expired/full and signed out, setup share message names the sender (KitchenGate->KitchenSetupScreen->inviteMessage, message test). Device evidence is the recorded pnpm e2e pass. Low findings, not filed: contract preview checks only that inviter is a string; no screen-level test covers the setup share wiring; a failed preview falls back to 'Your partner' without saying so (safe).
<!-- SECTION:NOTES:END -->
