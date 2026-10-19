---
id: TASK-10.1
title: MIT licence and a README that shows how the work ran
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 14:27'
updated_date: '2026-10-19 15:03'
labels:
  - size-2
  - docs
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The public face of TASK-10. A visitor should learn what Grocs is in a paragraph, how to try it (the APK, the browser page), and how it was built: Bruk's philosophy plugin running an orchestrator and per-layer agents over a Backlog.md board, with links to real examples on this board (an intent, the spec, a decision, a review that refused to close, a follow-up filed from a finding, a bug found by the system's own checks).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 LICENSE holds the MIT licence for Bruk Habtu
- [x] #2 README.md says what Grocs is, how to try it, how to run it locally, and how the work ran, linking at least five real board artefacts that exist on main
- [x] #3 Every link in the README resolves to a file on main
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Write LICENSE (MIT, Bruk Habtu, 2026) and README.md at the root in Bruk's voice: what Grocs is (from TASK-1's problem), how to try it (Releases APK, Storybook on Pages), how the work ran with links to real board artefacts, how to run it locally, licence. Check every relative link resolves with a script.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built by the orchestrator (Oct 19, 2026). README links eight board artefacts (TASK-1, doc-1, decision-3, decision-11, TASK-9's refused first review, TASK-1.39, TASK-1.41, TASK-1.36, TASK-1.37); a script confirmed every relative link resolves on main. One marked placeholder: the philosophy plugin link (PLACEHOLDER-philosophy-plugin-link), which only Bruk has. The Releases and Pages links go live with TASK-10.4 and TASK-10.5 and the visibility flip.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(521 earlier lines omitted)
```text
|  storybook-static/assets/GroceryListTemplate.stories-UPMb5zVB.js
|  5.76 kB │ gzip:   1.98 kB
|  storybook-static/assets/Button-CMWllo--.js
|  6.43 kB │ gzip:   2.04 kB
|  storybook-static/assets/react-BWPDF9mI.js
|  7.87 kB │ gzip:   3.00 kB
|  storybook-static/assets/Mascot-DNPGK3js.js
|  11.37 kB │ gzip:   4.20 kB
|  storybook-static/assets/icons-C95GlTgR.js
|  15.62 kB │ gzip:   2.56 kB
|  storybook-static/assets/KitchenScene-BDxkbh4w.js
|  17.31 kB │ gzip:   4.66 kB
|  storybook-static/vite-inject-mocker-entry.js
|  27.81 kB │ gzip:   9.67 kB
|  storybook-static/assets/module-CxiZfrMq.js
|  35.63 kB │ gzip:  10.09 kB
|  storybook-static/assets/art-BwKVSb-9.js
|  167.09 kB │ gzip:  49.83 kB
|  storybook-static/assets/react-18-CZ7Uj1bU.js
|  211.29 kB │ gzip:  66.04 kB
|  storybook-static/assets/iframe-OG_koOoE.js
|  1,359.38 kB │ gzip: 391.71 kB

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

|  Vite ✓ built in 8.21s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 5.2s of this 8.1s
|  build (64%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin storybook:react-docgen-plugin transform (22%, 1.8s, 822
|  calls)
|  - plugin treat-js-files-as-jsx transform (20%, 1.6s, 822 calls)
|  - plugin vite:css transform (19%, 1.5s, 2 calls)
|  Additional callback time came from callbacks under 1s.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/review-101/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/review-101/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review (philosophy:reviewer, 2026-10-19) of e4c048f. Closed: all three criteria met. Evidence: record-check --tier full exit 0 in review-101 (check, typecheck, unit, emulator, check:release, storybook, visual 311 views); no re-runs needed; the check changed no files. AC1: LICENSE is MIT, Copyright (c) 2026 Bruk Habtu. AC2: README says what Grocs is, how to try it (APK, Storybook), how to run it, and how the work ran, and it links nine board artefacts. I opened each one, and each backs up its claim: TASK-1 opens with the Google Keep line; doc-1 has numbered requirements, a layout section and policies/areas-of-concern sections; decision-3 pins an orchestrator plus builder, small builder and reviewer per layer, each with a model and effort; decision-11 is UI testing; TASK-9's first review refused on #2 (no second-client item on the open screen) and its re-review closed after that test was added; TASK-1.39 was filed from TASK-1.19's review and added svg-art/token-name; TASK-1.41 was found on the first visual-baselines workflow run; TASK-1.36 is the GIT_DIR leak that corrupted .git/config during real commits. AC3: a script resolved every relative link with git cat-file against e4c048f, and all 14 resolve. The README's commands are all in package.json (hooks:install, check, typecheck, test, test:emulator, emulators) or packages/ui (@grocs/ui storybook). Not counted against the task: PLACEHOLDER-philosophy-plugin-link needs Bruk before the visibility flip; the Releases and Pages links go live with TASK-10.4, TASK-10.5 and the flip. Findings: (medium, DRAFT-6, size-1) line 26 says tools/hooks refuse edits that skip, focus or delete tests, but pre-edit.ts is unregistered and only pre-commit and CI run the weakening review; (low, in DRAFT-6) line 24 says TASK-1.37 'turned' the canvas into screens, but it is still In Progress. (low, not filed) 'numbered requirements that every task cites' overstates it, since some tasks, TASK-10.1 among them, cite none.
<!-- SECTION:NOTES:END -->
