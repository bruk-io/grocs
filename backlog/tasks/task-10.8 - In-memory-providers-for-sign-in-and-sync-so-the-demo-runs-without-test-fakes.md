---
id: TASK-10.8
title: 'In-memory providers for sign-in and sync, so the demo runs without test fakes'
status: Done
assignee:
  - '@builder-providers'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 16:33'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-10.7
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-12: packages/providers-memory implements the auth and sync-store ports in memory for the demo build. It is a provider like any other, held to the same port contract suites as the Firebase provider, and nothing in it is a test fake. It shares an approach with the fakes in @grocs/ports/testing but not their code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 packages/providers-memory implements the auth and sync-store ports and passes the same port contract suites the Firebase provider passes
- [x] #2 Demo sign-in signs in a fixed demo member with no credentials, and nothing in the package touches the network or disk
- [x] #3 It imports only core and ports through their package entries, never @grocs/ports/testing, and pnpm check passes with no exemption added
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
builder-providers: stopped before editing, no package created. The auth port (packages/ports/src/auth/port.ts) has no method that fits a no-credential demo sign-in. AuthPort only reads the session and signs out. TestSignIn.signInWithTestAccount(email, password) needs credentials and is development-only (R53, kept out of release bundles). GoogleSignIn.signInWithGoogle() takes no arguments but is Google-specific, and its contract suite requires a failing pair (cancelled pick), which a demo has no meaning for. Options for Bruk/ports layer: (a) add a DemoSignIn port (signInAsDemoMember(): Promise<User>) with a contract suite, then providers-memory implements it; (b) accept a MemoryAuth-only method outside any port, which the UI could not call through a port. Ports not changed.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(522 earlier lines omitted)
```text
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

|  Vite ✓ built in 6.54s
|
!  Vite [33m[PLUGIN_TIMINGS] [0mJavaScript callbacks ran for 4.2s of this 6.5s
|  build (65%).
|  The slowest callbacks, timed inside each callback (the wait before a
|  callback starts is excluded, the time it awaits is included):
|  - plugin vite:css transform (33%, 2.1s, 2 calls)
|  - plugin storybook:react-docgen-plugin transform (25%, 1.6s, 822
|  calls)
|  - plugin treat-js-files-as-jsx transform (16%, 1.1s, 822 calls)
|  These rows add up to more than the total. Callbacks can overlap, so
|  the same time counts for more than one row.
|  See ]8;;https://rolldown.rs/reference/InputOptions.checks#bundlertimingshttps://rolldown.rs/reference/InputOptions.checks#bundlertimings]8;;
|  for more details.

|
o  Output directory:
|  /home/claude/grocs/.claude/worktrees/agent-a5be03ef66abb5d3a/packages/ui/storybook-static
|
—  Storybook build completed successfully


> @grocs/ui@0.0.0 visual /home/claude/grocs/.claude/worktrees/agent-a5be03ef66abb5d3a/packages/ui
> node --disable-warning=ExperimentalWarning ../../tools/visual.ts -- --no-build

visual: 311 story views checked (axe, 44 x 44, 311 images compared)
```

Review by philosophy:reviewer, Oct 19, 2026: closed. The full check at 92afb4c exited 0, with no timeouts. #1 met: vitest's unit project includes packages/*/src/**/*.test.ts. memory-auth.test.ts runs authContract and memory-sync-store.test.ts runs syncStoreContract against the new classes: 2 files, 16 tests pass. #2 met: signInAsDemoMember() takes no arguments and returns the fixed DEMO_MEMBER, as decision-12's last Consequences bullet says (a method on MemoryAuth, not a port). Source imports only @grocs/core and @grocs/ports: no fetch, no node:, no storage. #3 met: the test files are the only importers of @grocs/ports/testing, which the import-layers rule allows; pnpm check passed; no tools/ file changed, so no exemption was added. The pnpm-lock.yaml importer entry is the shape pnpm writes for two workspace:* links, and the orchestrator's frozen install changed nothing, so it is sound. The placeholder email bruk@demo.grocs.invalid is sound: .invalid is reserved (RFC 2606/6761) and can never resolve or be delivered to. Findings, no task: (low) the task's implementation notes still hold only the builder's earlier 'stopped before editing, no package created' report, with no report of the build; this review's notes replace it. (low) mergeItem notifies every watcher of the kitchen, whatever its week, which means extra callbacks but no wrong data. (info) with TASK-10.6's blindSpots run over this branch's files, it reports nothing, and every providers-memory file is matched.
<!-- SECTION:NOTES:END -->
