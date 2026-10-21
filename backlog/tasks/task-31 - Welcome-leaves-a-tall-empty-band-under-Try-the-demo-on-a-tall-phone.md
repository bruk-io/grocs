---
id: TASK-31
title: Welcome leaves a tall empty band under Try the demo on a tall phone
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 02:35'
labels:
  - size-2
  - layer-ui
dependencies:
  - TASK-29
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. SignInTemplate draws the kitchen scene at its own height (WORLD.height) and gives the sheet flex: 1, so on a 20:9 phone the sheet below the button is mostly empty white.

## Affected users and systems
Welcome (SignInTemplate, StageLayout), the first screen anyone sees.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 On a tall phone viewport (412 x 915) the kitchen scene takes the space above the sheet, its floor meeting the sheet, and the sheet is only as tall as its content plus the bottom inset
- [x] #2 On a short phone viewport (360 x 640) the button stays fully visible without scrolling
- [x] #3 Both viewports are in the visual baselines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
From TASK-29's review: with phone insets, Welcome (StageLayout) paints the 40-point band above the kitchen scene in the stage colour, lighter than the scene's sky (see packages/ui/visual-baselines/templates-sign-in--on-phone*.png). Cosmetic, nothing sits in the band; worth fixing alongside this Welcome layout work by filling the inset with the sky colour.

Built. Files: StageLayout.tsx (stage flex:1 on the scene's ceiling colour; wordmark now in the stage's flow, not absolute; sheet sizes to content), KitchenScene.tsx (outside the named files: window bottom-anchors the 600-high world, ceiling colour above, so the floor meets the sheet), SignInTemplate.stories.tsx (OnTallPhone 412x915, OnShortPhone 360x640 via a sized-frame decorator), layouts.behaviour.test.tsx (StageLayout assertions follow the wordmark moving into the flow; no test loosened). AC1: tall baseline shows floor meeting the sheet, sheet = button + 24 + gesture bar; the top band is the ceiling colour (TASK-29 note done). AC2: short baseline shows the button fully visible; the scene loses its ceiling and top of the cast shelf instead. AC3: templates-sign-in--on-tall-phone* and --on-short-phone* added. Caveat: the visual tool shoots at its fixed viewports (393x852, 412x929, 791x820), so the 412-wide frame is clipped to 393 in the iphone image and the 360x640 frame sits in the corner of a 393x852 image; the fold-outer image is the true 412 view. Checks: pnpm check, typecheck, pnpm test (1422), visual (359 compared) pass. Baselines for Bruk to approve - NEW: templates-sign-in--on-tall-phone{,--fold-outer,--fold-inner}.png, --on-short-phone{,--fold-outer,--fold-inner}.png. CHANGED: all templates-sign-in--{rest,primary-action,with-footer,on-phone}{,--fold-outer,--fold-inner}.png (sheet now content-height, stage fills above, wordmark in flow), organisms-kitchen-scene--{panning,reduced}.png (window bottom-anchored with ceiling colour).

Second pass (orchestrator feedback). KitchenScene now measures its window and scales the 1020x600 world uniformly to the window height (transform scale, origin top left; sides clip and the pan carries on). StageLayout: wordmark is absolute again (top = 24 + top inset) over the scene's own ceiling; the stage holds the scene full height, so there is no plain band at any height and on the short phone (360x640) the whole cast, both lower mascots included, is visible. Tall story decorator now uses a minimum-size frame so the sheet colour runs to the bottom edge (the lighter strip was the story frame, 915, inside a 929 browser viewport); short story keeps an exact frame. No file outside packages/ui touched. Checks: pnpm check, typecheck, pnpm test (1422), visual (359 compared) pass. Baselines regenerated; same set as before: new on-tall-phone and on-short-phone (x3 viewports), changed all templates-sign-in--* and organisms-kitchen-scene--* (scene now scaled to its window, about 1.0 in those stories) images.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(735 earlier lines omitted)
```text
|  4.69 kB │ gzip:   1.82 kB
|  storybook-static/assets/ItemRow-CuGB21en.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-w0OEt40Y.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-B4A8ScWO.js
|  6.43 kB │ gzip:   2.03 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-Cs5tWczY.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-ClGx9Nvz.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CkNXQF3s.js
|  17.47 kB │ gzip:   4.72 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-D_0oJJW2.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-spzFJyAu.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-D-X8NlyL.js
|  1,359.48 kB │ gzip: 391.76 kB

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

|  Vite ✓ built in 3.65s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 2.7s of this 3.6s
|  build (74%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (50%, 1.8s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (34%, 1.2s, 824
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a6cc81c6a7fa72500/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 359 story views checked (axe, 44 x 44, 359 images compared)
```

No repro: the band is a layout outcome (flex sizing at a viewport size) that the jsdom unit tests cannot measure; the reproduction is visual - the new on-tall-phone and on-short-phone baselines, which would show the old band against the pre-fix StageLayout.

Review (philosophy:reviewer): closed. Full check passed (pnpm check, typecheck, tests, Storybook build, visual 359 compared), no files reformatted; the route-test timeout did not recur. AC1: on-tall-phone--fold-outer (true 412 wide) shows the floor meeting the sheet, sheet = button + gesture bar. AC2: on-short-phone shows the button whole. AC3: met - the fold-outer image is the true 412x915 view and the short frame is exact in all three viewports; the iPhone image clipping 412 to 393 is a tool limit, not a gap. KitchenScene.tsx change outside the named files is justified: the scene had to scale for the stage to fill without a band. Finding (medium): at ~1.3x scale the pan stops (max -630 world units) never bring Enoki fully into frame on a tall phone and the static view shows only Shii; filed as a draft in this worktree (numbered DRAFT-14, colliding with main's DRAFT-14 - orchestrator to refile on main). Baselines await Bruk's approval.
<!-- SECTION:NOTES:END -->
