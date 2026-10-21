---
id: TASK-34
title: The kitchen's pan never shows the whole cast on a tall phone
status: Done
assignee:
  - '@builder-ui'
created_date: '2026-10-21 03:08'
updated_date: '2026-10-21 04:19'
labels:
  - size-2
  - layer-ui
dependencies:
  - TASK-31
modified_files:
  - packages/ui/src/organisms/kitchen/art/scene-layout.ts
  - packages/ui/src/organisms/kitchen/motion.ts
  - packages/ui/src/organisms/kitchen/KitchenScene.tsx
  - packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by TASK-31's reviewer (2026-10-20). Since TASK-31, KitchenScene scales the 1020 x 600 world to its window height (about 1.3x on a 412 x 915 phone). The pan keyframes stop at translateX -630 world units, tuned for scale 1. At 1.3x the window shows about 310 world units, so at the far stop it shows x 630-940: Enoki (917-973) never comes fully into view (about 22 of 56 units), and Cremi (584-648) is fully in view only mid-pan. At rest only Shii and the fridge are in frame. Suggested fix: derive the pan stops from the visible world width (window width / scale), for example clamping the last stop to -(WORLD.width - visibleWidth).

## Affected users and systems
Welcome, the first screen anyone sees; packages/ui KitchenScene.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 On 360 x 640, 412 x 915 and the Fold inner screen, every mascot in the scene comes fully into frame at some point in the pan
- [x] #2 Pan stops are computed from the window's visible world width, with unit tests at scale 1 and at 1.3
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Reproduce: at scale 1.3 (412x915) the window shows about 310 world units, so the fixed -630 stop shows x 630-940 and Enoki (917-973) is cut off.
Change: scene-layout.ts gains panStops(visibleWidth) returning mid and far: far = -(WORLD.width - visibleWidth) clamped to at most 0 (the kitchen's right edge, so Enoki is whole); mid centres Cremi in the window, clamped between far and 0. panKeyframes becomes panKeyframes(visibleWidth); sceneMotion(reduced, visibleWidth) passes it through. KitchenScene measures window width as well as height, visibleWidth = width / scale, and memoises the motion on it.
Tests: panStops unit tests at scale 1 and 1.3; for 360x640, 412x915 and the Fold inner screen every mascot's extent lies inside the visible span at some pan stop; reduced stays still. Visual: run the pass; list changed baselines in notes.
Modified files: packages/ui/src/organisms/kitchen/art/scene-layout.ts, motion.ts, KitchenScene.tsx, KitchenScene.behaviour.test.tsx
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. Files: packages/ui/src/organisms/kitchen/art/scene-layout.ts (panStops(visibleWidth) -> {mid, far}; panKeyframes(visibleWidth)), motion.ts (sceneMotion(reduced, visibleWidth)), KitchenScene.tsx (measures window width and height; visibleWidth = width / scale; motion memoised on it), KitchenScene.behaviour.test.tsx. Far stop = -(WORLD.width - visibleWidth) (kitchen's right edge, clamped to 0); mid centres Cremi.
AC2: panStops unit tests at scale 1 (393 wide: far -627, mid centres the stove) and 1.3 (412 wide: far about -703, beyond the old -630), plus a test that the scene motion's 57% keyframe uses far, and one that nothing moves past the left edge on a very wide window.
AC1: tests sweep the pan from 0 to far for 360x640 (scale 1.067), 412x915 (1.525 of the full-height window; the test uses window height 915) and Fold inner 791x820 and assert every mascot (all six placements) is fully inside the visible span at some stop. This is computed geometry, not a screenshot: the visual tool freezes the animation at its first frame, so no baseline shows the far stop.
Checks: pnpm check, pnpm typecheck, pnpm test (1435, 108 files), build-storybook and visual (359 compared) pass. Baselines: none changed, none new.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(738 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-DsZIB4fb.js
|  5.86 kB │ gzip:   2.03 kB
|  storybook-static/assets/Button-N2nyD7aV.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-DGHPgYwW.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-Bt7JcKoE.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-CMIMWyE5.js
|  17.73 kB │ gzip:   4.85 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-o0KMqmeD.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-CfsiWq12.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-CJNgQ0t7.js
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

|  Vite ✓ built in 5.10s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.2s of this 5.1s
|  build (84%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (36%, 1.8s, 824
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
|  /home/claude/grocs/.claude/worktrees/agent-a7941360fd30e8f82/packages/ui/storybook-static
|
—  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: 359 story views checked (axe, 44 x 44, 359 images compared)
```

Review (philosophy:reviewer): verdict is close once the repro is recorded. close-task refused only because no repro is recorded yet. Full check passed (exit 0); AC1 and AC2 ticked. AC1: the sweep uses the full screen height (412x915 -> scale 1.525, 270 visible units), not the real stage above the sheet. The real stage is shorter, so its scale is smaller and the window shows more world units. far is always the kitchen's right edge, and the sweep covers every offset in [far, 0], so a mascot that fits at full height also fits at the real stage: the test is a conservative bound and covers the real case. Finding (low, no draft): the line '1.525 of the full-height window' should say the test uses the full screen height as a conservative bound for the real, shorter stage. Repro for the orchestrator: packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx, 'KitchenScene > panStops > at scale 1.3 reaches further than the old fixed -630 stop' and 'KitchenScene > panStops > brings every mascot fully into frame at some stop on 412 x 915'.

Repro at 97315db576ac, test files: packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx; command: `pnpm exec vitest run --project ui packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx` exited 1

(31 earlier lines omitted)
```text
 FAIL  |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx > KitchenScene > panStops > at scale 1.3 reaches further than the old fixed -630 stop
AssertionError: expected -630 to be close to -703.0769230769231, received difference is 73.0769230769231, but expected 0.005
 ❯ packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx:80:19
     78|       const width = visible(412, 1.3);
     79|       const { mid, far } = panStops(width);
     80|       expect(far).toBeCloseTo(-(WORLD.width - width));
       |                   ^
     81|       expect(far).toBeLessThan(-630);
     82|       expect(mid).toBeGreaterThanOrEqual(far);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx > KitchenScene > panStops > never moves past the left edge when the window shows the whole kitchen
AssertionError: expected { mid: -290, far: -630 } to deeply equal { mid: +0, far: -0 }

- Expected
+ Received

  {
-   "far": -0,
-   "mid": 0,
+   "far": -630,
+   "mid": -290,
  }

 ❯ packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx:87:41
     85|
     86|     it('never moves past the left edge when the window shows the whole…
     87|       expect(panStops(WORLD.width * 2)).toEqual({ mid: 0, far: -0 });
       |                                         ^
     88|     });
     89|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx > KitchenScene > panStops > brings every mascot fully into frame at some stop on 360 x 640
 FAIL  |ui| packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx > KitchenScene > panStops > brings every mascot fully into frame at some stop on 412 x 915
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ packages/ui/src/organisms/kitchen/KitchenScene.behaviour.test.tsx:99:66
     97|       for (const host of cast) {
     98|         const sweep = Array.from({ length: 101 }, (_unused, i) => (far…
     99|         expect(sweep.some((stop) => wholeAt(stop, width, host))).toBe(…
       |                                                                  ^
    100|       }
    101|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 8 passed (13)
   Start at  00:15:36
   Duration  3.53s (transform 1.58s, setup 32ms, import 2.48s, tests 481ms, environment 365ms)
```

Correction (orchestrator, from the review): the 412 x 915 sweep uses the full screen height on purpose, as a safe bound. At scale 1.525 the window shows about 270 world units; the real stage above the sheet is shorter, so it shows more of the world. 1.525 is not the real stage's scale. The repro shims panStops to return the old fixed stops (mid -290, far -630) within the new API: on the literal old code the test file fails at import, because panStops did not exist.

Review (philosophy:reviewer): closed. Full check passed (exit 0); AC1 and AC2 met. AC1: the full-height sweep is a conservative bound, so it covers the real, shorter stage. Repro recorded by the orchestrator: with the old fixed stops shimmed in, five panStops tests failed. Low finding (the 1.525 note line) corrected in the notes. No drafts filed.
<!-- SECTION:NOTES:END -->
