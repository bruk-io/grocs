---
id: TASK-1.37.6
title: >-
  UI test harness: behaviour tests, browser pass with accessibility scan and
  visual baselines
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 03:19'
updated_date: '2026-10-19 04:29'
labels:
  - size-5
  - design-system
  - testing
milestone: m-2
dependencies:
  - TASK-1.19
modified_files:
  - package.json
  - pnpm-lock.yaml
  - packages/ui/package.json
  - tools/storybook-browser.ts
  - tools/shots.ts
  - tools/visual.ts
  - packages/ui/visual-baselines
  - packages/ui/src/atoms/Button.behaviour.test.tsx
  - packages/ui/src/atoms/Checkbox.behaviour.test.tsx
  - tools/checks/weakening.ts
  - tools/checks/weakening.test.ts
  - tools/hooks/pre-edit.ts
  - tools/hooks/hooks.test.ts
  - apps/mobile/src/routes/index.route.test.tsx
  - .claude/checks.json
parent_task_id: TASK-1.37
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Builds the shared tooling decision-11 (proposed) calls for, once, before the component tasks start, so each of them only writes its own tests. Spans packages/ui, apps/mobile test setup, tools/checks and CI, so it runs as a general builder. Cites R42, R50, R55, R56, R57, R65.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A behaviour-test pattern exists for components with callbacks or state props (decision-11 level 2), shown by tests for the existing Button and Checkbox that press by role, assert the callback and its arguments, and assert disabled and checked in the accessibility state
- [x] #2 One browser pass over the built Storybook runs an axe-core scan on every story and fails on any violation, and fails any button, checkbox or link smaller than 44 by 44 points (R42)
- [x] #3 The same pass compares each story's screenshot with its approved baseline in packages/ui/visual-baselines/ on Linux, and on other systems skips only the image comparison and says so; fonts are bundled files, motion is reduced, and viewports are fixed, so two runs give the same images
- [x] #4 pnpm --filter @grocs/ui visual:update is the only way baselines are created or changed; editing or deleting a baseline any other way is blocked as a weakening (R57), with the reason
- [x] #5 A route render-test pattern exists for the app (decision-11 level 4), shown by a test for the existing index route
- [x] #6 The browser pass runs before an agent stops (the full tier in .claude/checks.json) and in CI, while the after-edit hook stays under 5 seconds (R56)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Dependencies: add @axe-core/playwright and @testing-library/user-event (root devDependencies). Spike the route test (level 4) first, since expo-router/testing-library assumes jest.
2. Level 2 (criterion 1): Button.behaviour.test.tsx and Checkbox.behaviour.test.tsx beside the components, composed from the stories, userEvent, queried by role, asserting callback and arguments and disabled, busy and checked in the accessibility state. atoms.test.tsx stays untouched.
3. Level 3 (criteria 2, 3): extract the static server and Chromium lookup from tools/shots.ts into tools/storybook-browser.ts; add tools/visual.ts: per story an axe scan (fails on any violation), a 44x44 check on button, checkbox and link roles from measured boxes, and a screenshot compared with packages/ui/visual-baselines/<id>.png with a small tolerance on Linux, skipped with a printed notice elsewhere; a missing baseline fails and names visual:update. Reduced motion through emulated prefers-reduced-motion plus a global (window.__GROCS_REDUCE_MOTION__) set before load, for TASK-1.30's MotionProvider to read. Fixed viewport 393x852, Fold sizes for templates. Scripts visual and visual:update in packages/ui. Generate first baselines on Linux and look at them.
4. Criterion 4: tools/checks/weakening.ts treats packages/ui/visual-baselines/ as protected (hook edits, staged and CI diffs, shell commands) except through visual:update; fixture tests in weakening.test.ts and hooks.test.ts; the reason names R57 and the command.
5. Criterion 5: route test for the index route in apps/mobile using expo-router's testing utilities, app on fakes; ListScreen tests unchanged.
6. Criterion 6: add the pass to the full tier in .claude/checks.json and to the CI bundles job (Chromium install in CI only); time the post-edit hook.
7. Merge main, run pnpm check, typecheck, test, check:release and the pass; write the how-to into the task notes.

### Risks
- expo-router/testing-library may rely on jest globals or native modules under jsdom; spike first.
- Pixel flakiness from fonts or animation; fonts awaited, reduced motion, fixed viewport, two runs compared before committing baselines.
- The protected folder must not block visual:update itself; the allowance is keyed on the exact script command. PNGs cannot be line-diffed, so the rule is path-based.
- Edits to tools/checks and CI only add checks; no existing rule is loosened. The browser pass stays out of the after-edit hook to hold the 5 s budget.
- Real-browser axe may find violations in existing stories; those get fixed in component code, never by exclusions.

### Proof
pnpm check, typecheck, test (behaviour, route, weakening fixtures), check:release, the visual pass run twice with identical results, a deliberate visible change failing it, post-edit hook timing, main merged. Delivers R42, R50, R55, R56, R57, R65.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Report (builder)

Branch worktree-agent-ae65e1e40311b9f8c, three commits on top of main (f8812ce patterns, 5a3cecc browser pass, fc366da determinism flags).

### Criteria and evidence
1. Behaviour pattern (level 2): packages/ui/src/atoms/Button.behaviour.test.tsx and Checkbox.behaviour.test.tsx. userEvent, queried by role and name, assert the callback and its arguments (toHaveBeenCalledExactlyOnceWith), aria-disabled, aria-busy and aria-checked, and a keyboard press. They found a real bug: Button passed the press event to onPress, whose type promises no arguments; fixed in Button.tsx. atoms.test.tsx is unchanged. Finding left open: on react-native-web a checkbox toggles on Enter but not on Space (WAI-ARIA wants Space); not fixed here, worth a follow-up in the molecules task.
2. Browser pass: pnpm --filter @grocs/ui visual (tools/visual.ts). Per story and viewport it runs @axe-core/playwright on #storybook-root, failing on any violation, and fails any button, checkbox or link under 44 x 44 measured from the rendered box. 39 story views pass. Proved it can fail: a temporary Button edit (low-contrast fill, 30 px height) failed axe color-contrast, the 44 x 44 check and the image comparison in one run; reverted.
3. Baselines: packages/ui/visual-baselines/ holds 39 PNGs plus manifest.json. Compared on Linux with a 0.1% pixel tolerance (pixelmatch threshold 0.1); other systems print 'image comparison skipped on <platform>' and still run axe and sizes. Fonts are the bundled @fontsource files, awaited via document.fonts.ready; prefers-reduced-motion plus window.__GROCS_REDUCE_MOTION__ are set; viewport is 393 x 852 (templates also get the Fold outer and inner sizes, baselines named <id>--fold-outer.png and <id>--fold-inner.png); Chromium is pinned to software drawing. Three consecutive visual:update runs gave byte-identical manifests. I looked at every baseline in a contact sheet and several singly: fonts, icons, mascots and the kitchen scene render correctly. Each story is cropped to #storybook-root.
4. Only visual:update writes baselines and manifest.json (a hash of each image). Blocked otherwise: (a) pre-edit hook denies Edit or Write to anything in the folder and shell commands that rm, mv, cp, redirect, sed -i, find -delete etc. on it (weakening/edit-baseline, R57, with the reason and the update command); (b) new check visual-baselines (registry; runs in pre-commit, CI, the stop hook and the after-edit hook when a baseline changed) fails any image added, edited or deleted without the manifest, or a missing manifest, so an edit that reaches the repository by an editor or merge still fails. Fixture tests: tools/checks/visual-baselines.test.ts, tools/hooks/baseline-hook.test.ts. Live tamper test: appending a byte to a PNG failed pnpm check with the rule and reason.
5. Route pattern (level 4): apps/mobile/src/routes/index.route.test.tsx renders the real app/index.tsx through expo-router's ExpoRoot (react-native-web, jsdom, app on fakes) for the signed-out and signed-in cases. expo-router/testing-library itself needs jest and @testing-library/react-native, so I used ExpoRoot with its inMemoryContext helper instead. Cost: apps/mobile/testing/route-setup.ts shims how Node loads expo-router (react-native to react-native-web, stubs for react-native-screens, safe-area-context and expo-glass-effect, ES-module Expo packages converted with babel, .web files preferred), and vitest.config.ts gives the app project .web extensions, a setup file and inline Expo packages. ListScreen tests unchanged. If an Expo upgrade breaks route tests, look at route-setup.ts first.
6. Tiers: .claude/checks.json full tier now ends with build-storybook then visual -- --no-build; the stop hook (tools/hooks/stop.ts) runs the pass when the change touches packages/ui, art, tokens or the pass itself (about 46 s with the build); CI bundles job installs Chromium, runs the pass and uploads packages/ui/.visual-diff on failure. After-edit hook timed at 0.8 to 1.6 s per call (limit 5 s); the pass is not in it.

### Checks run
pnpm check (13 checks) passed; pnpm typecheck passed; pnpm test 390+ tests in 43+ files passed; pnpm check:release passed; pnpm --filter @grocs/ui visual passed (39 views, 39 images compared). pnpm test:emulator not run (needs Java and is outside this task). main was already merged (git merge main: up to date).

### How component tasks write their tests
- Every component has stories first: one per declared state, args only (decision-10). Everything below is driven by them.
- Level 1 and the accessibility test run on every story automatically. Nothing to write.
- Level 2, only for a component with a callback or state prop: copy Button.behaviour.test.tsx. composeStories(stories), render a story with a vi.fn() prop, userEvent.setup({ pointerEventsCheck: 0 }) (disabled controls ignore the pointer, which is what you assert), query by getByRole(role, { name }), assert the callback and its arguments and the aria-* state. No style or internals assertions. Name the file <Component>.behaviour.test.tsx beside the component.
- Level 3, nothing to write: add the stories, run pnpm --filter @grocs/ui visual. It fails on a missing baseline; run pnpm --filter @grocs/ui visual:update (Linux only), look at the new PNGs, and commit them with the manifest. Never edit or delete files in visual-baselines by hand: the hook and the check refuse. Use visual -- <text> to run only stories whose id contains the text, and visual:update -- <text> to approve only those. A failed comparison leaves actual and diff images in packages/ui/.visual-diff/.
- Template stories are drawn at the phone and both Fold sizes when the story title starts with Templates/.
- Level 4, for a route: copy index.route.test.tsx. renderRoute({ index: Home }, { app: await appOnFakes({ signedIn }), location }) from apps/mobile/testing/render-route.tsx; add the route files the test needs to the first argument, keyed by file name. Assert on text and roles; follow a link by clicking it and check the new screen.
- Motion (TASK-1.30): the pass sets the prefers-reduced-motion media query and window.__GROCS_REDUCE_MOTION__ = true before the page loads. The MotionProvider should treat either as reduce motion (in react-native-web AccessibilityInfo.isReduceMotionEnabled reads the media query). Nothing reads the global yet, so no story currently animates; the first animated mascot must hold still in this pass or its baselines will flake.

### Things to know
- First CI run: baselines were made on this Linux sandbox's Chromium, CI installs its own. If CI shows small differences, download the visual-diff artifact, then regenerate on one Linux machine and review.
- The write guard hook is not registered in settings (per CLAUDE.md), so the pre-edit denial is proven by hook tests, not by this session's own edits.
- Added dev dependencies: @axe-core/playwright, @testing-library/user-event, pixelmatch, pngjs, @babel/core and its modules-commonjs plugin. UI agent definitions regenerated to list visual and visual:update.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(259 earlier lines omitted)
```text
|  0.57 kB │ gzip:   0.34 kB
|  storybook-static/assets/part-CPsKuf4c.js
|  0.75 kB │ gzip:   0.48 kB
|  storybook-static/assets/Badge-CesZknFR.js
|  0.85 kB │ gzip:   0.53 kB
|  storybook-static/assets/Text-DocQriIp.js
|  1.08 kB │ gzip:   0.55 kB
|  storybook-static/assets/rolldown-runtime-BCiCTKAo.js
|  1.30 kB │ gzip:   0.71 kB
|  storybook-static/assets/preload-helper-DQzUoscV.js
|  1.64 kB │ gzip:   0.87 kB
|  storybook-static/assets/Checkbox-CUKJzNBf.js
|  2.42 kB │ gzip:   1.11 kB
|  storybook-static/assets/Button.stories-mPGulRrI.js
|  2.48 kB │ gzip:   1.14 kB
|  storybook-static/assets/ItemRow.stories-BHkQEWWC.js
|  2.69 kB │ gzip:   1.25 kB
|  storybook-static/assets/TextField.stories-BNNplqgX.js
|  2.94 kB │ gzip:   1.34 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascots.stories-B-4vznFn.js
|  10.60 kB │ gzip:   2.70 kB
|  storybook-static/assets/Kitchen.stories-B8k3ewnT.js
|  13.91 kB │ gzip:   3.31 kB
|  storybook-static/assets/Icons.stories-BEo2FhA3.js
|  16.40 kB │ gzip:   2.95 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-D1AnYciA.js
|  35.62 kB │ gzip:  10.08 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-B1YOB8k4.js
|  1,218.80 kB │ gzip: 351.34 kB

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

|  Vite ✓ built in 2.77s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-ae65e1e40311b9f8c/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-ae65e1e40311b9f8c/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 39 story views checked (axe, 44 x 44, 39 images compared)
```

Review (philosophy:reviewer): every criterion met by evidence and ticked, but not closed. close-task refused: .claude/checks.json changed since acceptance (e4a3e2f) and there is no 'Checks changed:' note. The change only adds build-storybook and visual to the full tier, which criterion 6 asks for, so the orchestrator or builder should add a 'Checks changed:' note saying so, then re-run close-task. Evidence: full tier via record-check exit 0; visual pass run twice more, 39 views and 39 images compared, same result both times, tree clean; after-edit hook 1.4-1.6 s (R56 5 s); baselines inspected. Findings: (medium) CI baselines may differ through runner fonts or freetype even though the browser build matches (headless shell 1248), with no CI regeneration path: DRAFT-2 (size-2). (low) Checkbox toggles on Enter, not Space: noted on TASK-1.37.1. (low) Route-test shims in apps/mobile/testing/route-setup.ts are fragile on Expo upgrades; documented, not filed. vitest.config.ts and ci.yml diffs only add.

Checks changed: .claude/checks.json, full tier only. Added '&& pnpm --filter @grocs/ui visual -- --no-build' after the existing build-storybook step, so the browser pass (axe scan, 44 x 44 targets, screenshot baselines) runs in the full tier, as acceptance criterion 6 asks. The fast tier is unchanged and no existing command was removed or loosened.

Review (philosophy:reviewer): closed. All six criteria met by evidence (full tier exit 0; visual pass twice, identical; after-edit hook 1.4-1.6 s). Checks changed note present. Findings: DRAFT-2 (CI baselines, size-2); Checkbox Space key noted on TASK-1.37.1; route-test shims fragile on Expo upgrades, documented.
<!-- SECTION:NOTES:END -->
