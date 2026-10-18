---
id: TASK-1.11
title: Which animation runtime runs the mascots and the Welcome scene? (D6)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 23:27'
labels:
  - size-2
  - design-system
milestone: m-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-5 -
    Animation-Reanimated-CSS-animations-on-react-native-svg-for-mascots-and-the-kitchen.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D6 in doc-1: Rive or Reanimated (or both), and how reduce motion is honoured (R40, R41).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-5 on 2026-10-18, from research. Waiting on Bruk to accept. Open: 60 fps for the kitchen pan on the Fold's inner screen, checked on the phone.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook` exited 0

(155 earlier lines omitted)
```text
│  option. You can remove the plugin and set resolve.tsconfigPaths: true
│  in your Vite config instead.
│  Vite vite v8.3.4 building client environment for production...
transforming...
✓ 302 modules transformed.
rendering chunks...
computing gzip size...
│  Vite storybook-static/iframe.html                              18.66
│  kB │ gzip:   5.27 kB
│  storybook-static/assets/iframe-Dz6ySFS4.js                 0.04 kB │
│  gzip:   0.06 kB
│  storybook-static/assets/Badge.stories-Bw1bWDLG.js          0.28 kB │
│  gzip:   0.23 kB
│  storybook-static/assets/Checkbox.stories-CWKP0SXZ.js       0.50 kB │
│  gzip:   0.32 kB
│  storybook-static/assets/Text.stories-JiK2ywtu.js           0.57 kB │
│  gzip:   0.34 kB
│  storybook-static/assets/Badge-DAi34iyw.js                  0.85 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/Text-BnbgowVj.js                   1.05 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/rolldown-runtime-BCiCTKAo.js       1.30 kB │
│  gzip:   0.71 kB
│  storybook-static/assets/preload-helper-DQzUoscV.js         1.64 kB │
│  gzip:   0.87 kB
│  storybook-static/assets/Button.stories-CesRtrie.js         2.43 kB │
│  gzip:   1.12 kB
│  storybook-static/assets/Checkbox-CqMRbPVr.js               2.45 kB │
│  gzip:   1.13 kB
│  storybook-static/assets/ItemRow.stories-DFwaSh4d.js        2.70 kB │
│  gzip:   1.25 kB
│  storybook-static/assets/Text-D2guw9ro.js                   3.62 kB │
│  gzip:   1.55 kB
│  storybook-static/assets/react-BWPDF9mI.js                  7.87 kB │
│  gzip:   3.00 kB
│  storybook-static/assets/TextField.stories-C4QECVHX.js      8.35 kB │
│  gzip:   3.44 kB
│  storybook-static/assets/Pressable-DfI3QPHN.js             12.06 kB │
│  gzip:   4.36 kB
│  storybook-static/vite-inject-mocker-entry.js              27.81 kB │
│  gzip:   9.67 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js             211.29 kB │
│  gzip:  66.04 kB
│  storybook-static/assets/iframe-D0mY_p35.js             1,192.99 kB │
│  gzip: 342.28 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│  Vite ✓ built in 500ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed.

Criterion #1 "Decision recorded" is met: decision-5 (Animation: Reanimated CSS animations on react-native-svg for mascots and the kitchen) exists at backlog/decisions/decision-5, status accepted, dated 2026-10-18 18:36, and is the decision this task references in its References field. It answers D6 on both halves of the question: the runtime (Reanimated 4.7.1 + react-native-svg 15.16.0, no Rive/Lottie/Skia, R40) and how reduce motion is honoured (MotionProvider/useMotion gate, ReducedMotionConfig, per-surface reduced behaviour, R41). Options weighed with versions and sources; consequences and the ruled-out capability are stated.

Reviewer-tier check recorded on this task: full tier (pnpm check && typecheck && test && test:emulator && check:release && build-storybook) exited 0. No files were reformatted or fixed by the run; the only working-tree changes are this task file and the pre-existing untracked mise.toml.

Findings, none blocking and none filed as a draft:
- Low: the implementation notes still read "Waiting on Bruk to accept", which was true when written and is now stale. Left as the worker's report rather than reworded; this closing note is the correction.
- Low: decision-5 carries one open item, whether the panning kitchen holds 60 fps on the Fold's inner screen with rasterisation on, with the Skia fallback for the scene alone named. Not filed separately: it is recorded in the decision's Consequences and lands in TASK-1.30 (Mascots and motion), which already depends on this task, so a new task would duplicate queued work in the same area.
- Note for whoever implements: the decision couples art to code through part names (body, cap, eyeL, eyeR, mouth) and mouth path structure, and mandates new checks in tools/checks for mouth-path structure and raw motion values in mascot files. Those are TASK-1.30 and TASK-1.19 work, not a gap here.
<!-- SECTION:NOTES:END -->
