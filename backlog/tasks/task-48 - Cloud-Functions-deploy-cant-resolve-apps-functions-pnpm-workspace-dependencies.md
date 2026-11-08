---
id: TASK-48
title: >-
  Cloud Functions deploy can't resolve apps/functions' pnpm workspace
  dependencies
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:04'
updated_date: '2026-11-08 19:43'
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
- [ ] #2 The bundling step is committed (e.g. a predeploy hook in firebase.json plus a build script in apps/functions), not a one-off local workaround
- [ ] #3 pnpm emulators (local functions emulator against the real TypeScript source) is unaffected and still works exactly as it does today
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
<!-- SECTION:NOTES:END -->
