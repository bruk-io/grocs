---
id: TASK-38
title: 'check:demo runs only in the demo APK workflow, not on pull requests'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 19:03'
updated_date: '2026-10-21 15:22'
labels:
  - size-1
  - ci
dependencies: []
modified_files:
  - .github/workflows/ci.yml
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-10.4 added pnpm check:demo (tools/demo-bundle.ts) and runs it only in .github/workflows/demo-apk.yml, which triggers on apk/**, demo-v* tags and by hand. ci.yml does not run it, so a change on main that pulls Firebase into the demo bundle is only caught when Bruk cuts a demo tag, after merge, and the tag then gets no Release.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ci.yml runs pnpm check:demo on pull requests and pushes to main, or the reason it can't is written in ci.yml
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. In .github/workflows/ci.yml's bundles job, add a step running pnpm check:demo right after the existing pnpm check:release step - same job, since both build Expo bundles and check:release already runs there with no special env setup (demo-bundle.ts sets APP_VARIANT=demo/EXPO_PUBLIC_APP_VARIANT=demo itself, the same way release-bundle.ts needs nothing special from the caller).

### Risks
Low: check:demo exports a second set of bundles (demo variant) in the same job as check:release's real-variant bundles, adding to the job's running time - acceptable, since TASK-10.4's own demo-apk.yml already does this same export as part of a slower, separate workflow, and catching a Firebase leak into the demo bundle before merge (not after a tag is cut) is the point of this task.

### Proof
ci.yml's YAML stays valid; pnpm check:demo passes locally against the current repo (no Firebase code reaches the demo bundle today, confirmed earlier this session).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
ci.yml's bundles job now runs pnpm check:demo right after pnpm check:release, same job, no extra env setup needed (demo-bundle.ts sets APP_VARIANT=demo itself). Verified locally: pnpm check:demo passes (demo bundles hold no Firebase code, 2 bundles, 5 barred path patterns), pnpm check (14 checks) and typecheck are clean, pnpm test passes (110 files, 1458 tests - one transient, non-reproducing flake in an unrelated test cleared on immediate retry, consistent with background contention from other concurrent work this session, not this change).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

```text
[ERR_PNPM_UNSUPPORTED_ENGINE] Unsupported environment (bad pnpm and/or Node.js version)

Your Node version is incompatible with "/Users/brukhabtu/src/github.com/bruk-io/grocs".

Expected version: >=24.12
Got: v22.21.1

This is happening because the package's manifest has an engines.node field specified.
To fix this issue, install the required Node version.
```

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(650 earlier lines omitted)
```text
│  3.25 kB │ gzip:   1.26 kB
│  storybook-static/assets/Chip-BUFjlRrJ.js
│  3.25 kB │ gzip:   1.46 kB
│  storybook-static/assets/SignInTemplate.stories-C2mavLNd.js
│  3.43 kB │ gzip:   1.58 kB
│  storybook-static/assets/ItemPickerTemplate.stories-DzX-EyfK.js
│  4.44 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-CHYc_axs.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/TextField-To7tQEQW.js
│  4.64 kB │ gzip:   1.78 kB
│  storybook-static/assets/PreferencesTemplate.stories-CHx3Hag1.js
│  4.69 kB │ gzip:   1.82 kB
│  storybook-static/assets/ItemRow-DUEZVMeX.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-C5gLF-j_.js
│  5.86 kB │ gzip:   2.03 kB
│  storybook-static/assets/Button-nz_NcS2H.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-BXxKbH4C.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-DNMLVkV0.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-BeyU00Yd.js
│  17.99 kB │ gzip:   5.00 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-2u7D0HhU.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-mBh1rsaE.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-f5cOUJnj.js
│  1,359.50 kB │ gzip: 391.76 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.12s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 362 story views checked (axe, 44 x 44, images not compared)
```

Reviewed by philosophy:reviewer (did not do the work). Verdict: closed, AC #1 met.

Evidence for AC #1 ('ci.yml runs pnpm check:demo on pull requests and pushes to main'): ci.yml's triggers are 'push: branches: [main]' and a bare 'pull_request:'; the 'bundles' job carries no job-level 'if:' and no 'needs:'; and the new step 'Demo bundle holds no Firebase code (TASK-10.4)' running 'pnpm check:demo' carries no 'if:' either. That chain - not merely the step's presence - is what makes the criterion met. The diff in 618be1e is exactly the 2-line addition to .github/workflows/ci.yml right after 'pnpm check:release', with no other source change.

Checks re-run on current main (all under 'mise exec --'): pnpm check:demo passes (demo bundles hold no Firebase code, 2 bundles, 5 barred path patterns); pnpm check 14/14; pnpm typecheck clean; pnpm test 110 files / 1458 tests passed with no flake on this run (the worker's one-off non-reproducing failure did not recur). Full reviewer tier recorded above exited 0, including pnpm test:emulator. No file was reformatted or fixed by the checks; the working tree is clean apart from the pre-existing untracked mise.toml.

Findings, all note-only, none filed as drafts:
1. The first recorded full-tier block on this task (exited 1, ERR_PNPM_UNSUPPORTED_ENGINE, Node v22.21.1) is a reviewer-environment artifact, not a failure of this change: record-check was invoked without 'mise exec --', so its pnpm subprocess picked up the wrong Node. The following block, run under mise, exited 0. Root cause is that mise.toml is untracked in this repo, so the Node pin that makes plain pnpm resolve correctly is not committed - any reviewer running the declared full tier without 'mise exec --' gets the same false failure. Out of scope here and not the reviewer's to commit.
2. Process deviation: AC #1 arrived at review already ticked by the worker in 618be1e, leaving the reviewer nothing to tick. board-check close accepts it because it matches the last commit, so the close proceeds; noting that under close-work the tick is meant to be the reviewer's.
3. The declared full tier runs check:release but not check:demo, so the reviewer tier does not itself exercise the check this task wired into CI; it was run separately here. Low impact now that ci.yml runs it on every PR and push to main.
4. Nit: the new step's name cites a task ID (TASK-10.4) where sibling steps cite durable rule IDs (R53, R64). It does state why the step exists, so it meets the repo convention; task IDs just age worse than rule IDs.
<!-- SECTION:NOTES:END -->
