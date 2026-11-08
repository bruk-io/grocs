---
id: TASK-48
title: >-
  Cloud Functions deploy can't resolve apps/functions' pnpm workspace
  dependencies
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:04'
updated_date: '2026-11-08 20:34'
labels:
  - size-2
  - layer-orchestrator
dependencies: []
modified_files:
  - tools/build-functions.ts
  - tools/build-functions.test.ts
  - firebase.deploy.json
  - package.json
  - pnpm-lock.yaml
  - .gitignore
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Discovered live tonight (Oct 24, 2026) getting kitchen sharing working end to end: apps/functions depends on @grocs/providers-server via workspace:*, which only resolves locally through pnpm's own symlinks. firebase deploy --only functions zips just apps/functions and runs plain npm install on it remotely (Cloud Build), which fails outright on the workspace: protocol (npm error EUNSUPPORTEDPROTOCOL). The live project (io-bruk-grocs-dev) had literally never had a successful functions deploy before tonight for this reason, among others (Cloud Functions API was also never enabled, and the Cloud Run services ended up with no IAM invoker binding — both fixed separately, see TASK-1.20's notes). Worked around it by hand tonight: bundled apps/functions/src/index.ts with esbuild (already present in the tree via Vite/Vitest, no new dependency needed) into a single CJS file with @grocs/providers-server/@grocs/core/@grocs/ports inlined, temporarily swapped apps/functions/package.json to a workspace-free version pointing at the bundle, deployed, then restored the original package.json. That's not committed anywhere and isn't repeatable by anyone else (or by me, next time, without re-deriving it) - it needs a real predeploy step.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 firebase deploy --only functions succeeds from a clean checkout with no manual package.json editing or ad-hoc shell commands
- [x] #2 The bundling step is committed (e.g. a predeploy hook in firebase.json plus a build script in apps/functions), not a one-off local workaround
- [x] #3 pnpm emulators (local functions emulator against the real TypeScript source) is unaffected and still works exactly as it does today
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. tools/build-functions.ts bundles apps/functions/src/index.ts with esbuild into apps/functions/deploy, with workspace packages inlined and npm packages external, writes a package.json with no workspace: references, and runs npm install there.
2. firebase.deploy.json points functions at that directory, with the build as its predeploy. firebase.json stays as it is for the emulators.
3. esbuild becomes a pinned root devDependency, and the output directory is gitignored.

### Risks
- A deploy needs --config firebase.deploy.json; a plain firebase deploy still uses firebase.json and fails as before.
- R52's no-production check forbids a real project id or deploy command in the repo, so no npm script can hold the command. It lives in these notes.
- esbuild's bundled code could fail only at runtime on Cloud Run, which a dry run cannot show.

### Proof
- Unit tests on the manifest; the bundle loads under node and exports all seven functions.
- A dry-run deploy from a clean clone.
- A real deploy, which only Bruk runs.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-08 evidence. The deploy command, kept out of the repo by R52: pnpm exec firebase deploy --only functions --config firebase.deploy.json --project io-bruk-grocs-dev

Clean clone: git clone, pnpm install --frozen-lockfile, then that command with --dry-run: packaged 43.43 KB, 'Dry run complete!', clone left with no changes. The dry run calls Google to confirm APIs and generates the pubsub and eventarc service identities on io-bruk-grocs-dev (idempotent); it deploys nothing. Bundle: no workspace: in its package.json, no @grocs/ import in index.js; node imports it and lists acceptInvite cancelInvite createKitchen findMyKitchen importRecipe inviteByEmail invitesForMe. firebase.json and apps/functions are unchanged from main, so the emulators still use the TypeScript source (#3).

#1 is NOT proved: no real deploy was run. It would put importRecipe live on the dev project, which is Bruk's call.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(817 earlier lines omitted)
```text
│  3.73 kB │ gzip:   1.49 kB
│  storybook-static/assets/KitchenSetupTemplate.stories-DNMss1pw.js
│  4.34 kB │ gzip:   1.73 kB
│  storybook-static/assets/ItemPickerTemplate.stories-BhqMxZMn.js
│  4.45 kB │ gzip:   1.58 kB
│  storybook-static/assets/Button.stories-Btl_3CFU.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/ItemRow-DvUMp8hC.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/PreferencesTemplate.stories-D5Odmrfs.js
│  5.30 kB │ gzip:   2.04 kB
│  storybook-static/assets/TextField-BnPWFEqF.js
│  5.35 kB │ gzip:   2.03 kB
│  storybook-static/assets/MealFormTemplate.stories-hbL71utF.js
│  6.26 kB │ gzip:   2.11 kB
│  storybook-static/assets/Button-BoEyW2D8.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/GroceryListTemplate.stories-B6FC8Y0H.js
│  9.46 kB │ gzip:   3.16 kB
│  storybook-static/assets/Mascot-9qzfYchL.js
│  12.29 kB │ gzip:   4.47 kB
│  storybook-static/assets/icons-D9-RnOgP.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-ksyHI9MX.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-Bk-jiIm0.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-C68uENE-.js
│  167.09 kB │ gzip:  49.81 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-COUQCjPE.js
│  1,361.35 kB │ gzip: 392.25 kB

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

│  Vite ✓ built in 1.57s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/.claude/worktrees/functions-deploy/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 458 story views checked (axe, 44 x 44, images not compared)
```

Review 2026-11-08: NOT closed. #2 and #3 ticked; #1 open.
#1: a dry run does not prove it. It stops before upload, so Cloud Build's npm install and the Cloud Run start, the failure this bug is about and the stage after it, never ran. Remaining: Bruk runs the real deploy from a clean clone with the command above, calls one function on the live service, including importRecipe, and records the result. He also decides whether --config firebase.deploy.json satisfies #1: plain firebase deploy --only functions, as #1 is worded, still reads firebase.json and still uploads the workspace: package. If it does not, the wording is his to change (finish-moved) or the config needs another shape.
#2: the build script and predeploy are committed; a firebase.deploy.json in place of firebase.json is within the criterion's e.g. #3: firebase.json, apps/functions and tools/emulators.ts are unchanged and the full check's test:emulator passed with apps/functions/deploy present. pnpm emulators itself was not started.
Reviewer verified: rebuilding with the same esbuild options gives a byte-identical index.js; its only non-node imports are firebase-admin and firebase-functions, both in the manifest; no dynamic import, require, import.meta, __dirname or process.env in the bundle; node loads it and all seven exports are gcfv2 callables. pnpm check passes, including firebase-isolation/no-production. The clean-clone dry run was not repeated (it touches the live project); that result is the worker's.
Not tested: the contract suite against the bundle. Running it from a scratch copy was denied by the reviewer guard.
Findings: (high) #1 unproved, as above. (medium) deploying without --config still fails. (medium) new Cloud Run services may lack the invoker binding, as TASK-1.20 saw, so a successful deploy can still leave importRecipe uncallable: test a real call. (medium) Cloud Build npm install, runtime credentials and first start are unseen by a dry run. (low) the deployed lockfile is generated at deploy time from caret ranges, so versions can drift from pnpm-lock (both match today: functions 7.4.0, admin 14.5.0). (low) CI never runs the build; tests cover only the manifest helpers. (low) board-check needs a repro or a No repro: note before this bug can close. (low) these notes hold the live project id and deploy command, which the check skips because it does not scan .md. No drafts filed.

2026-11-08: the emulator project ran against the bundle itself, not the TypeScript source, through a temporary config pointing functions at apps/functions/deploy. See the result in the next note. Open: a real deploy and a real call to a function, including importRecipe, since an invoker binding may be missing on a new service.

Result: all seven functions loaded from the bundle; 11 files, 144 tests passed. Not proved by this: Cloud Build's install, Cloud Run start, IAM invoker.

No repro: the bug is in Cloud Build's npm install on deploy, which only a real deploy to a live project can show, and that is Bruk's call.
<!-- SECTION:NOTES:END -->
