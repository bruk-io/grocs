---
id: TASK-1.33
title: Declare the repository's checks in .claude/checks.json
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:39'
updated_date: '2026-10-18 23:24'
labels:
  - size-1
  - architecture
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.3 and TASK-1.4. record-check --tier full fails with 'no checks declared' because .claude/checks.json is missing, so a reviewer's check output can't be recorded on the task. The full tier the reviewer ran by hand: pnpm check, typecheck, test, test:emulator, check:release, and the ui build-storybook.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 record-check --tier fast and --tier full run and record the repository's checks
- [x] #2 The full tier runs the same commands as CI
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Check `pnpm check && pnpm typecheck && pnpm test` exited 0

```text

> grocs@0.0.0 check /Users/brukhabtu/src/github.com/bruk-io/grocs
> node tools/checks/run.ts --mode all

checks passed (9 checks, all mode, 87 ms)

> grocs@0.0.0 typecheck /Users/brukhabtu/src/github.com/bruk-io/grocs
> tsc --noEmit


> grocs@0.0.0 test /Users/brukhabtu/src/github.com/bruk-io/grocs
> vitest run --project unit --project ui --project app --project tools


 RUN  v4.1.12 /Users/brukhabtu/src/github.com/bruk-io/grocs


 Test Files  35 passed (35)
      Tests  271 passed (271)
   Start at  19:23:31
   Duration  4.77s (transform 2.25s, setup 0ms, import 5.68s, tests 5.63s, environment 1.31s)
```

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
│  Vite ✓ built in 675ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Redone from a fresh worktree branched off current main (which has TASK-1.36's fix), after the first attempt's worktree predated that fix and correctly hard-stopped without committing. Both acceptance criteria verified with real record-check runs on main: --tier fast (271/271 tests, 9 checks) and --tier full (additionally test:emulator, check:release, ui build-storybook - all exit 0, output recorded above); full tier's commands match .github/workflows/ci.yml exactly except the PR-only weakening --mode ci step, already covered locally by lefthook's --mode staged step. Committed as 59316ba, fast-forward merged into main.
<!-- SECTION:NOTES:END -->
