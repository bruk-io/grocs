---
id: TASK-32
title: A mascot's speech bubble runs off the screen and covers Settings
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-20 22:33'
updated_date: '2026-10-21 04:23'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. Mascot.tsx centres a fixed-width bubble over the mascot. In MainHeader and SubHeader the mascot sits at the right edge, so half the bubble is off screen ('Soup's on! Well... almo') and it covers the Settings button. Its text also sets fontFamily from tokens.font.family.body rather than fontFace, so on a phone it falls back to the system face (the case TASK-1.37.7 #2 describes).

## Affected users and systems
Mascot molecule, MainHeader, SubHeader; Groceries, Meal plan and Add a meal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 In MainHeader and SubHeader at 360 wide, each mascot's longest line shows whole inside the screen with its tail pointing at the mascot, in the visual baselines
- [x] #2 The bubble never covers the header's Settings button or another control
- [x] #3 The bubble's text uses the registered Nunito face on native through fontFace, as SpeechBubble does
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Mascot gets bubbleSide ('above' default | 'left'): left opens the bubble beside the mascot (right:100%, centred vertically, tail on its right edge pointing at the mascot), so it stays inside the screen and never rises over the header's top row (Settings). MainHeader and SubHeader pass 'left' and take a mascotState prop (forwarded to forceState) for stories. Bubble text uses fontFace('body', bold). New 360-wide speaking stories for both headers give the baselines. Modified files: packages/ui/src/molecules/Mascot.tsx, packages/ui/src/organisms/MainHeader.tsx, MainHeader.stories.tsx, SubHeader.tsx, SubHeader.stories.tsx, new visual baselines.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. Mascot has bubbleSide ('above' default, 'left'): left puts the bubble beside the mascot (right:100%, vertically centred, tail on its right edge pointing at it), so in MainHeader/SubHeader (both pass 'left') it stays on screen and never rises over the top row with Settings. Both headers take mascotState (forwarded to forceState) for stories. Bubble text now uses fontFace('body', bold) (AC3). New token size.phoneNarrow = 360 (tokens.json, regenerated) for the stories' width (design-tokens/raw-value). New stories at 360 wide: MainHeader SpeakingAt360 (cremi), MealPlanSpeakingAt360 (shii), SubHeader SpeakingAt360 (chanty). Evidence: AC1 baselines organisms-mainheader--speaking-at-360, organisms-mainheader--meal-plan-speaking-at-360, organisms-subheader--speaking-at-360 show the line whole inside the frame, tail pointing right at the mascot. AC2 the bubble is beside the mascot, below the top row, so Settings is clear in the images. AC3 code. Note: pinned stories show each mascot's first line (cremi 'Stirring! Don't tell Chanty I salted it.', the longest of its three); the bubble is a fixed 200 wide so any line wraps within it. Baselines: only 3 NEW images, none changed: the three above (+ manifest.json). pnpm check, typecheck, full pnpm test (1430 pass) and visual (356 compared) all pass.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(722 earlier lines omitted)
```text
|  storybook-static/assets/TabItem-CCXkoMdT.js
|  3.21 kB │ gzip:   1.35 kB
|  storybook-static/assets/SubHeader-CMS8k5Fl.js
|  3.25 kB │ gzip:   1.26 kB
|  storybook-static/assets/Chip-BUh_xqzE.js
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/ItemPickerTemplate.stories-DDADOmYO.js
|  4.44 kB │ gzip:   1.58 kB
|  storybook-static/assets/Button.stories-C3nwNWUV.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/TextField-BOkQ-sO9.js
|  4.64 kB │ gzip:   1.78 kB
|  storybook-static/assets/PreferencesTemplate.stories-Bed3b6Ji.js
|  4.69 kB │ gzip:   1.82 kB
|  storybook-static/assets/ItemRow-DbK_1iQ8.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-D9P7THKu.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-BiYvzScF.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-uNKpQ6uk.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-DfLtf5gL.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene--RbSziJP.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-jUxlBWY2.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-DCNDbegC.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DX7jJdds.js
|  1,359.50 kB │ gzip: 391.76 kB

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

|  Vite ✓ built in 3.82s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a570f397b4d47a20b/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 356 story views checked (axe, 44 x 44, 356 images compared)
```

Review (philosophy:reviewer): all three criteria met and ticked; full check passed (pnpm check, typecheck, tests, visual 356 compared), nothing reformatted. #1: bubble is fixed 200 wide, opens right:100% of a 68 mascot with an 8 gap inside 16 padding, so at 360 its left edge is at 68 for every line; the longest header lines (cremi, shii, chanty) wrap to two lines at most. #2: bubble sits beside the mascot below the top row; baselines show Settings and avatars clear. #3: fontFace('body', bold). size.phoneNarrow is used only by stories. mascotState is set nowhere outside stories and only forwards to forceState, so no phone can be stuck. Not closed: close-task refuses a bug without a recorded repro. One is possible: the new SpeakingAt360 visual stories fail against the pre-fix Mascot.tsx (bubble centred, off screen). Record it with record-check TASK-32 --repro -- <the visual run on those three stories against ead0dbc^'s Mascot.tsx>, or add a unit/render test asserting the bubble's left edge >= 0 at 360, then rerun close-task.

Repro at ead0dbc63660, test files: tools/visual.ts, packages/ui/src/organisms/MainHeader.stories.tsx, packages/ui/src/organisms/SubHeader.stories.tsx; command: `node ../../tools/visual.ts speaking-at-360 src/organisms/MainHeader.stories.tsx src/organisms/SubHeader.stories.tsx` exited 1

(340 earlier lines omitted)
```text
|  storybook-static/assets/Button-C2A0aqzY.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-DrdUOwPY.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-B1xC2NqV.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CPPZDvsH.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-D9YiIxfI.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-C1cPJeSG.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-uiqPIZbf.js
|  1,359.50 kB │ gzip: 391.77 kB

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

|  Vite ✓ built in 6.71s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.4s of this 6.7s
|  build (81%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (36%, 2.4s, 824
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
|  /home/claude/grocs/.claude/worktrees/agent-a570f397b4d47a20b/packages/ui/storybook-static
|
—  Storybook build completed successfully

visual: 3 story views checked (axe, 44 x 44, 3 images compared)
visual: FAILED organisms-mainheader--meal-plan-speaking-at-360 @ iphone: looks different from its baseline: 2645 pixels differ (3.62%, limit 0.10%). See packages/ui/.visual-diff/organisms-mainheader--meal-plan-speaking-at-360.png; if the change is intended run `pnpm --filter @grocs/ui visual:update`
visual: FAILED organisms-mainheader--speaking-at-360 @ iphone: looks different from its baseline: 4112 pixels differ (3.96%, limit 0.10%). See packages/ui/.visual-diff/organisms-mainheader--speaking-at-360.png; if the change is intended run `pnpm --filter @grocs/ui visual:update`
visual: FAILED organisms-subheader--speaking-at-360 @ iphone: looks different from its baseline: 1354 pixels differ (1.85%, limit 0.10%). See packages/ui/.visual-diff/organisms-subheader--speaking-at-360.png; if the change is intended run `pnpm --filter @grocs/ui visual:update`
```

Review (philosophy:reviewer): closed. All three criteria met (see review note above); full check passed. Repro recorded: the three speaking-at-360 visual stories fail against ead0dbc^'s Mascot.tsx (1.85-3.96% pixels differ) and pass with the fix. Findings: none filed; minor style only (SubHeader story inlines its 360 decorator, MainHeader names it at360).

Bruk saw the three new speaking-at-360 images on 2026-10-21 and chose this placement (beside the mascot, covering part of the title for the few seconds after a tap) over opening below it. The visual baselines workflow run 39542631603 on task-32-bubble produced the same 356 images byte for byte; that choice is recorded as the approval of these images.
<!-- SECTION:NOTES:END -->
