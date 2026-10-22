---
id: TASK-40
title: 'Kitchen hosts drift on short scenes, and the pan''s scale has no test'
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-21 12:52'
updated_date: '2026-10-22 04:46'
labels:
  - layer-ui
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
From TASK-36's review (2026-10-21):
1. Hosts are sized size * scale, but the Mascot's 44 dp minimum target is not scaled. When size * scale < 44 (for a 62 dp host, a scene under about 425 dp tall), the Pressable is larger than the art and centres it, so the art shifts right and down by (44 - size*scale)/2 from its place in the world. The bubble also draws at full size. Keeping the unscaled target and bubble is right for accessibility; the drift is not.
2. Nothing tests the new scale multiply in panKeyframes; the existing tests run at scale 1.

## Affected users and systems
KitchenScene on Welcome, on short screens (landscape, small phones).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 On a scene under 425 dp tall, each host's art sits at its place in the world while its target stays at least 44 x 44
- [x] #2 A test checks that sceneMotion(false, w, s) puts far * s at the 57% keyframe
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Reproduce: host is size*scale but Mascot's Pressable has an unscaled 44 dp min target that centres the art, so on short scenes the art shifts by (44 - size*scale)/2.
Change: scene-layout.ts gains targetDrift(size, scale, target) = -max(0, target - size*scale)/2; KitchenScene applies it as marginLeft/marginTop on each host so the art stays at its world place while the target and bubble keep full size. Test: targetDrift unit tests, and sceneMotion(false, w, 1.5) 57% keyframe equals far*1.5.
Modified files: packages/ui/src/organisms/kitchen/KitchenScene.tsx, packages/ui/src/organisms/kitchen/art/scene-layout.ts, packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. KitchenScene applies targetDrift(size, scale, target) (new in art/scene-layout.ts) as marginLeft/marginTop on each host, so the art keeps its world place while the 44 dp target and bubble stay unscaled. AC1: unit tests on targetDrift (scale 0.5 on a 62 host pulls back by half the excess; no drift once art >= target); computed, not a screenshot (visual tool freezes at first frame on WORLD-size window). AC2: new test sceneMotion(false, 300, 1.5) 57% keyframe equals far*1.5. Checks: pnpm check, typecheck, pnpm test (1542 passed, 116 files), visual (398 compared) pass. Baselines: none changed, none new.

Repro at 21d480c8a4d7, test files: packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx; command: `pnpm exec vitest run --project ui packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx` exited 1

```text

 RUN  v4.1.12 /home/claude/grocs/.claude/worktrees/agent-a1dad36beb3643df0

 ❯ |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx (19 tests | 1 failed) 998ms
       × pulls a small host back by half the target excess so its art keeps its place 24ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx > KitchenScene > target drift (TASK-40) > pulls a small host back by half the target excess so its art keeps its place
AssertionError: expected +0 to be -6.5 // Object.is equality

- Expected
+ Received

- -6.5
+ 0

 ❯ packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx:77:56
     75|   describe('target drift (TASK-40)', () => {
     76|     it('pulls a small host back by half the target excess so its art k…
     77|       expect(targetDrift(62, 0.5, tokens.size.target)).toBe(-(tokens.s…
       |                                                        ^
     78|     });
     79|     it('does not move a host whose art is at least as big as the targe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 18 passed (19)
   Start at  00:25:28
   Duration  4.28s (transform 1.67s, setup 31ms, import 2.62s, tests 998ms, environment 392ms)
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(754 earlier lines omitted)
```text
|  storybook-static/assets/PreferencesTemplate.stories-DPGsyaaw.js
|  4.69 kB │ gzip:   1.82 kB
|  storybook-static/assets/ItemRow-llxbSZd0.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/Button-BgtS2tHB.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/GroceryListTemplate.stories-D727agKQ.js
|  9.35 kB │ gzip:   3.10 kB
|  storybook-static/assets/Mascot-C9NlIACf.js
|  12.29 kB │ gzip:   4.46 kB
|  storybook-static/assets/icons-D_9tsqTo.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BQPooMS0.js
|  18.10 kB │ gzip:   5.05 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-C4IE0SAU.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-BY4K-uQi.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-DKAbW5-C.js
|  1,360.62 kB │ gzip: 392.03 kB

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

|  Vite ✓ built in 3.78s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 2.7s of this 3.7s
|  build (74%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (32%, 1.2s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (31%, 1.2s, 835
|  calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a1dad36beb3643df0/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 398 story views checked (axe, 44 x 44, 398 images compared)
```

Closed by philosophy:reviewer. Full check exit 0 (check, typecheck, tests, storybook build, visual 398 compared); it changed no source files. AC1 met on computed geometry: targetDrift is -(44 - size*scale)/2, which is exactly the Mascot's centring offset, so the art's top-left lands at the world place; the target keeps minWidth/minHeight 44 and the repro shows the drift test fails without the correction. AC2 met: sceneMotion(false, 300, 1.5) 57% equals far*1.5. Findings, none filed: (low) the target is centred on the art, so it reaches (44 - size*scale)/2 past the art on each side; with overflow hidden on the window, shii's target (left 46) clips at the left edge below scale 0.286 (scene under ~171 dp tall), and enoki's at the right edge at the far stop below ~176 dp; top and bottom only below ~70 dp. Before this change the left/top edges never clipped but the right/bottom ones clipped sooner. No Welcome layout is known to give a scene that short, so no task; if one appears, clamp the drift against the window. (low) the AC1 test covers targetDrift, not that KitchenScene applies it; the call site is a single style line. No image shows a short scene because the visual tool freezes at the first frame.
<!-- SECTION:NOTES:END -->
