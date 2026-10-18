---
id: TASK-1.13
title: 'Which test tooling, and which hook runs each check? (D8)'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 23:32'
labels:
  - size-2
  - architecture
milestone: m-1
dependencies:
  - TASK-1.4
references:
  - >-
    backlog/decisions/decision-9 -
    Tests-vitest-Maestro-declared-check-tiers-and-new-checks.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D8 in doc-1: test runners, the end-to-end tool and which flows it covers (R51), check scripts and hooks, judgement-only rules, mutation testing later (R46 to R58).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-9 on 2026-10-18. Includes a reproduced gap: vitest 4 projects ignore the root allowOnly unless extends is set. Waiting on Bruk to accept.

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
│  Vite ✓ built in 495ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Reviewed by philosophy:reviewer; I did not do the work.

Verdict: closed. AC #1 (Decision recorded) is met: decision-9 'Tests: vitest, Maestro, declared check tiers and new checks' exists, status accepted (2026-10-18 19:01), is the task's references target, and answers D8 end to end (runners, R49 rules tests, Maestro flows for R51/R52, the new registry checks, the hook/tier table, R58 rules-file bar, Stryker later). Full tier recorded: exited 0, no files reformatted or fixed by the run.

Findings:
- Medium, filed as DRAFT-4: vitest's five inline projects do not inherit the root allowOnly: false without extends: true, reproduced in the decision against the repo's vitest 4.1.12. decision-9 decided the fix but it is not built, so an it.only reaching the repo past the pre-edit hook still passes pre-commit and CI. DRAFT-4 carries the reproduction and the decision's three proofs as criteria. Needs filing on main by the orchestrator.
- Low, notes only: decision-9's other unbuilt items (rules-coverage, schema-versions, personal-marking, sync/no-transactions, e2e-emulator-only, reference-built, the Maestro flow set, Stryker) are the decision's forward plan for later slices, not defects in this task. No drafts filed; they belong to the slices that introduce the code they guard.
- Low, notes only: the checks.json gap decision-9 recorded is already closed by TASK-1.33, so the fast and full tiers run. No action.
- Low, notes only: still unproven per the decision's own Consequences - lefthook through a real commit, the hooks inside a live session, the vitest 5 move. Tracked there, and TASK-1.36 covers the related git fixture leak.

No git or environment anomaly encountered; git status showed only this task's note file and an untracked mise.toml.
<!-- SECTION:NOTES:END -->
