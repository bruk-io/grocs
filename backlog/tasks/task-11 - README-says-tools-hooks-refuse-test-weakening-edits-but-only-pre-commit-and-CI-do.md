---
id: TASK-11
title: >-
  README says tools/hooks refuse test-weakening edits, but only pre-commit and
  CI do
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 15:03'
updated_date: '2026-10-19 15:56'
labels:
  - size-1
  - docs
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-10.1 (README at e4c048f, line 26): 'The hooks in tools/hooks refuse edits that skip, focus or delete tests.' The guard that would do that at edit time, tools/hooks/pre-edit.ts, was unregistered from .claude/settings.json on 2026-10-18 (CLAUDE.md). The registered hooks are launch-guard (Agent), post-edit (--mode files) and stop (--mode all), and none of them runs the weakening review. That review (tools/checks/weakening.ts via run.ts reviewGitChange) runs only in --mode staged (lefthook pre-commit) and --mode ci. So a public reader is told about an edit-time guard that is currently off. Also line 24 says TASK-1.37 'turned' the canvas into screens, but TASK-1.37 is still In Progress.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README says where test-weakening is actually refused (at pre-commit and in CI, by the weakening review), or the edit-time guard is re-registered first
- [x] #2 README's TASK-1.37 line matches its status
- [x] #3 README says the Storybook site exists only once the repo is public (TASK-10.5's criterion 2)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Edit README.md only: the hooks sentence says checks run after agent edits, at pre-commit and in CI, and that pre-commit and CI refuse weakening changes; the TASK-1.37 line says the screens are built and it stays open for the phone checks; the browser line says the Pages site exists once the repo is public.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by the orchestrator (size 1, the doer accepts). Not re-registering the edit-time guard: Bruk unregistered it on Oct 18, 2026, so the README now says what is true. Criterion 3 added at acceptance because the TASK-10.5 review refused on the same README.

Built by the orchestrator, Oct 19, 2026: all three sentences edited as planned.

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

|  Vite ✓ built in 5.49s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/review-11/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/review-11/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

No repro: a README wording bug has no failing test; the evidence is the comparison of README lines against settings.json, lefthook.yml, ci.yml, run.ts, TASK-1.37's status and storybook-pages.yml in the review note.

Review by philosophy:reviewer, Oct 19, 2026: closed. Full check exited 0. #1 met: post-edit (Edit|Write, --mode files), lefthook --mode staged and ci.yml run the checks; run.ts runs reviewGitChange only in staged and ci modes. #2 met: TASK-1.37 In Progress, open children 1.37.7/1.37.8 are the phone checks. #3 met: storybook-pages.yml on the TASK-10.5 branch deploys only once Pages is available, which needs a public repo. Findings: (medium) CI runs the weakening review only on pull_request, not on pushes to main, which is how this repo lands work; filed as DRAFT-6. (low, no task) post-edit covers Edit|Write, not Bash writes; TASK-1.37.1 is still In Progress at 5/5; Pages also needs Source set to GitHub Actions, and the workflow reaches main only when TASK-10.5 merges.
<!-- SECTION:NOTES:END -->
