---
id: TASK-10.5
title: Storybook published to GitHub Pages for friends without Android
status: Done
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 16:11'
labels:
  - size-2
  - ci
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: iPhone friends open every screen and component in a browser. A workflow builds Storybook and deploys it to GitHub Pages on each push to main. Pages on this plan needs the repo public, so the site goes live when Bruk flips the visibility; until then the workflow must not fail CI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A workflow builds Storybook and deploys it to GitHub Pages on push to main, and does nothing harmful while the repo is private
- [x] #2 The README and the workflow say the Pages URL and that it goes live when the repo is public
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Files: .github/workflows/storybook-pages.yml (new). Not README.md (Bruk writes it in parallel).
1. Verify the base path first: build Storybook, serve packages/ui/storybook-static under a /grocs/ prefix, load it in Chromium (Playwright's, from PLAYWRIGHT_BROWSERS_PATH), and check the iframe, the manager, the fonts (Fredoka, Nunito woff2) and a story all load with no 404 under /grocs/. If Storybook's default relative base breaks, set it in the workflow or .storybook/main.ts viteFinal base.
2. Workflow storybook-pages.yml: on push to main plus workflow_dispatch; runs-on ubuntu-24.04; same setup as ci.yml bundles job (checkout@v7, pnpm/action-setup@v6, setup-node@v7 node 24 cache pnpm, pnpm install --frozen-lockfile, pnpm --filter @grocs/ui build-storybook). Job build: builds, asks the Pages API whether Pages is on with a GitHub Actions source (gh api repos/$GITHUB_REPOSITORY/pages, any failure -> output deploy=false plus a notice), uploads the artifact (actions/upload-pages-artifact@v5) only when deploying. Job deploy (needs build, if deploy == 'true', environment github-pages, pages: write + id-token: write, actions/deploy-pages@v5). Private repo or Pages off: build runs green, deploy is skipped, nothing fails. No continue-on-error (weakening check flags it). concurrency group pages, no cancel. Workflow comment states https://bruk-io.github.io/grocs/ and that it goes live once the repo is public and Pages source is GitHub Actions.
3. Prove: actionlint (pip/npx) on the workflow; run the check-script logic locally against a stubbed gh for the 404 / legacy / workflow cases; pnpm check; pnpm typecheck.
4. Report in the task notes; commit on the worktree branch through the hook.
Risk: AC #2 also mentions the README, which I am told not to edit; I tick only the workflow half and hand the URL to Bruk.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Started: builder agent in worktree agent-ac2b92d54102b1cc6.

Report (builder). Added the workflow storybook-pages.yml in the workflows folder, three jobs on ubuntu-24.04: gate (asks the Pages API whether Pages is on with source GitHub Actions; any other answer sets deploy=false, writes the reason to the run summary and a notice, exits 0), build (only when deploy=true: same setup as the ci.yml bundles job, build-storybook, upload-pages-artifact v5), deploy (environment github-pages, deploy-pages v5). Private repo or Pages off: gate is green, build and deploy are skipped. No continue-on-error. Triggers: push to main and workflow_dispatch. The workflow comment states https://bruk-io.github.io/grocs/ and that it goes live when the repo is public and Pages source is GitHub Actions.

Sub-path proof: Storybook 10.6.2 builds with relative asset paths, so no base config was needed. Served packages/ui/storybook-static under /grocs/ only (everything outside the prefix returns 404 and is logged) and loaded it in Playwright's Chromium: the manager, a story iframe (templates-grocery-list--groceries) and a manager deep link. Result: 0 bad responses, 0 failed requests, 0 page errors, 0 requests outside /grocs/; Fredoka 600 and 700 and Nunito 600 and 800 loaded (woff2 requests all 200). A screenshot of the deep link showed the sidebar, toolbar and story drawn.

Workflow proof: actionlint 1.7.12 reports 0 errors. The gate script was syntax-checked and run against a stub of the GitHub CLI for four cases (404, 403, legacy source, workflow source): deploy is false, false, false, true, and every run exits 0. The repo checks and the typecheck both passed.

Not provable without a public repo: that the workflow token with pages read permission may call the Pages API, and the deploy itself. If the gate says Pages is unavailable on a public repo that has Pages on, read the API message in the run summary. Open: AC 2 also names the README; Bruk is writing it and will link the URL, so only the workflow half is done here. Action versions come from release pages (upload-pages-artifact 5.0.0, deploy-pages 5.0.0, both Node 24), because the sandbox could not call the API for those repos.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(508 earlier lines omitted)
```text
|  3.25 kB │ gzip:   1.46 kB
|  storybook-static/assets/SignInTemplate.stories-CsauxLyI.js
|  3.69 kB │ gzip:   1.53 kB
|  storybook-static/assets/ItemPickerTemplate.stories-CcyRBnsx.js
|  4.34 kB │ gzip:   1.52 kB
|  storybook-static/assets/Button.stories-CAJZrr0Y.js
|  4.47 kB │ gzip:   1.31 kB
|  storybook-static/assets/PreferencesTemplate.stories-BReMROY1.js
|  4.55 kB │ gzip:   1.74 kB
|  storybook-static/assets/TextField-C08YPR7o.js
|  4.58 kB │ gzip:   1.76 kB
|  storybook-static/assets/ItemRow-CN7fxOqi.js
|  5.19 kB │ gzip:   1.99 kB
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

|  Vite ✓ built in 5.02s
|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-ac2b92d54102b1cc6/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-ac2b92d54102b1cc6/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review (philosophy:reviewer, 2026-10-19) of 3ae0d34. Not closed: AC2 is half met (close-task refused on #2). Evidence: record-check --tier full exit 0 in the worktree (13 checks, 1193 unit tests, 27 emulator tests, check:release, storybook, visual); no load re-runs needed; the check changed no files. AC1 met. The gate job asks gh api repos/<repo>/pages. While the repo is private it gets 404, sets deploy=false, writes a notice and exits 0, so build and deploy are skipped and the run stays green. There is no continue-on-error. Permissions are least-privilege: contents: read at the top, pages: read on the gate, nothing extra on build, and pages: write plus id-token: write only on deploy. concurrency is pages, with no cancel. Sub-path proof, per the builder's notes: Storybook 10.6.2 builds relative assets, served under /grocs/ in Chromium with 0 bad responses and the fonts loaded; actionlint is clean; the gate was run against a stubbed gh for 404, 403, legacy and workflow. Action v5 tags were confirmed by the orchestrator. AC2 not met. The workflow comment gives https://bruk-io.github.io/grocs/ and says it goes live once the repo is public and Pages source is GitHub Actions. main's README (e4c048f, line 10) links the URL but does not say it goes live when the repo is public. Either add that line to the README (size-1), or the finish-line owner rewords AC2, since a public README hardly needs it; once either is done, tick #2 and close. Unproven until the repo is public, not unmet: that the github.token with pages: read can read the Pages API on a public repo, and the deploy itself. Findings: (low, not filed) a transient Pages API error on a public repo skips the deploy green, with only a notice; this is acceptable because the next push or a workflow_dispatch republishes. (info) this branch is one commit behind main (e4c048f, README/LICENSE only).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(521 earlier lines omitted)
```text
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

|  Vite ✓ built in 5.30s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 3.3s of this 5.2s
|  build (64%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (44%, 2.3s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (22%, 1.2s, 822
|  calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-ac2b92d54102b1cc6/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-ac2b92d54102b1cc6/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Re-review by philosophy:reviewer, Oct 19, 2026: closed. Full check at 6ecb7be exited 0 (took over 10 minutes, no timeouts). #2 now met: README line 10 (merged from main, c193873) gives bruk-io.github.io/grocs and says the site exists only once the repo is public; storybook-pages.yml's header says the URL and that it goes live when the repo is public and Pages source is GitHub Actions. Low finding, no task: the README omits the Pages-source step the workflow names; the workflow's run summary says it when it matters.
<!-- SECTION:NOTES:END -->
