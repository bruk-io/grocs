---
id: TASK-48
title: >-
  Cloud Functions deploy can't resolve apps/functions' pnpm workspace
  dependencies
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-24 20:04'
updated_date: '2026-10-24 20:10'
labels:
  - size-2
dependencies: []
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
