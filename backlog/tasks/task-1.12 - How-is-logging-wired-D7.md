---
id: TASK-1.12
title: How is logging wired? (D7)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 23:30'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies:
  - TASK-1.4
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D7 in doc-1: the port wrapper, command middleware, correlation context, redaction marking and on-phone buffer (R31 to R37). Proposed from the walking skeleton.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-8 on 2026-10-18. Waiting on Bruk to accept.

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
│  Vite ✓ built in 508ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed. AC #1 "Decision recorded" is met: decision-8 ("Logging: keep the skeleton's wiring and close its gaps") exists at backlog/decisions/decision-8, status accepted (2026-10-18 19:01), names D7 and TASK-1.12 in its Context, and is this task's References target. It covers all five parts the description asks for (port wrapper, command middleware, correlation context, redaction marking, on-phone buffer) and maps each of R31-R37 to a decision, with options weighed, consequences, ruled-out alternatives and cited sources.

Full-tier check (pnpm check, exit 0) recorded above. No files were reformatted or fixed by the check; the only working-tree change is this task file.

Findings, all low and none blocking the close; all answered here, none filed as a draft:
- The decision defers four buildable pieces to later tasks (R33 global handlers in observe.ts, per-subscription correlation ids and callback wrapping, GrocsError plus describeError message withholding, the personal-marking check, the persisted buffer on R28's key-value port). They are design output, not gaps in this task, but nothing on the board carries them yet; the orchestrator should make sure the logging slice's implementation tasks pick them up, since R33 and R35 are currently unmet in code.
- Until the key-value port lands, R35 is met only while the app runs, and kitchenRole stays "none" until R2/R3. Both are stated in Consequences, so they are accepted trade-offs rather than oversights.
- The "Still open" items (hosted log provider configuration, share sheet for the diagnostics copy) are recorded in the decision and need no separate open question under TASK-1.

No git or environment anomaly encountered.
<!-- SECTION:NOTES:END -->
