---
id: TASK-10.7
title: Register packages/providers-memory as a provider
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 16:33'
labels:
  - size-1
dependencies: []
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Before the in-memory provider is built (decision-12), the repo has to know the package is a provider: the import-layers layer map, the providers agent config (and regenerated agents), and doc-1's repository layout.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 import-layers maps providers-memory to the providers layer, so providers-isolated and allowed-imports apply to it, with a test
- [x] #2 The providers agent config covers packages/providers-memory/**, the agents are regenerated, and pnpm check's agent-definitions check passes
- [x] #3 doc-1's repository layout lists packages/providers-memory and what it is for
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Map providers-memory to the providers layer in tools/checks/import-layers.ts with a test; add packages/providers-memory/** to tools/agents/configs/providers.json and regenerate the agents; add the package to doc-1's repository layout.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). import-layers: PACKAGE_LAYER maps providers-memory to providers; a new test shows it may import ports and core, is refused another provider (providers-isolated) and the test fakes (testing-entry-test-only). 18/18 import-layers tests pass. providers.json covers the package; pnpm agents:generate rewrote the three providers agents. doc-1's layout lists the package (one line); TASK-1 marked finish-moved for the spec change.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(508 earlier lines omitted)
```text
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/SignInTemplate.stories-BJ7sbCBj.js
|  3.69 kB │ gzip:   1.53 kB
|  storybook-static/assets/ItemPickerTemplate.stories-84KNSM2C.js
|  4.34 kB │ gzip:   1.52 kB
|  storybook-static/assets/Button.stories-oKuUPhPX.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/PreferencesTemplate.stories-x1S07O_a.js
|  4.55 kB │ gzip:   1.74 kB
|  storybook-static/assets/TextField-BUQ8W6wa.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-DlxtsPQG.js
|  5.19 kB │ gzip:   1.99 kB
|  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
|  5.75 kB │ gzip:   1.97 kB
|  storybook-static/assets/Button-HlTd63fv.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-CVO2Zfzk.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-D4zA4yxG.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-_dK9hVdg.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-d75twOs6.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-wrpbBZ8J.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-7rNFOYcX.js
|  1,359.38 kB │ gzip: 391.72 kB

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

|  Vite ✓ built in 5.71s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a5be03ef66abb5d3a/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a5be03ef66abb5d3a/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review by philosophy:reviewer, Oct 19, 2026: closed. Reviewed 1d68ad5 with git show; the full check ran in the TASK-10.8 worktree (92afb4c, which contains 1d68ad5) and exited 0, because the reviewer's hook refused a new worktree. #1 met: PACKAGE_LAYER maps providers-memory to providers; the new import-layers test shows ports and core allowed, another provider refused (providers-isolated) and @grocs/ports/testing refused (testing-entry-test-only). #2 met: providers.json lists packages/providers-memory/**, the three providers agents gained exactly that line, and agent-definitions passed in pnpm check. #3 met: doc-1's layout gains exactly one line. TASK-1 carries finish-moved and a dated note for the spec change. No findings.
<!-- SECTION:NOTES:END -->
