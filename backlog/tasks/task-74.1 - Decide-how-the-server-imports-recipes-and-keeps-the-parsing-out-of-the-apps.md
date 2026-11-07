---
id: TASK-74.1
title: Decide how the server imports recipes and keeps the parsing out of the apps
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-07 01:12'
labels:
  - size-1
  - providers
dependencies: []
references:
  - >-
    backlog/decisions/decision-15 -
    Recipe-import-one-Cloud-Function-fetches-parses-and-caches-the-apps-only-call-it.md
parent_task_id: TASK-74
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-74's server side was agreed in conversation on 2026-11-06 but is not written down, and spec doc-1's layout has no place for code only the server may use. The apps must know nothing about recipe sites or parsing; they send a URL and get a parsed recipe back. The order is to prove it locally first (Functions emulator) before any deployment work.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A decision record covers: a Cloud Function callable as the only thing that fetches and parses; a shared Firestore cache keyed by canonical URL, kept indefinitely; the raw Recipe JSON-LD kept separately from the parsed recipe; failed URLs not fetched again for 1 day
- [x] #2 The decision names the package that holds the server-only parsing and fetching, where it sits in doc-1's layers, and the import rule that stops app code importing it
- [x] #3 The decision states what the apps share with the server: the parsed recipe type and the error kinds, and where they live
- [x] #4 The decision says how emulator tests exercise the cache and failure memory without fetching live sites
- [x] #5 doc-1 is updated (or its update is filed) for the new package and layer rule
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
decision-15 written (proposed) on 2026-11-07, covering every criterion. doc-1's update is filed as a child of TASK-74 rather than made now, so the spec isn't edited before Bruk accepts the decision. Waiting on Bruk to accept decision-15. Checked while deciding: core-purity covers only packages/core/src today, and no app imports @grocs/providers-server (the one mention in a phone bundle is a comment in providers-firebase).

Bruk accepted decision-15 on 2026-11-07. Ready for review.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(748 earlier lines omitted)
```text
│  9.35 kB │ gzip:   3.10 kB
│  storybook-static/assets/Mascot-BGA0f5dQ.js
│  12.29 kB │ gzip:   4.46 kB
│  storybook-static/assets/icons-eB6EtNXc.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-CZopag8i.js
│  18.10 kB │ gzip:   5.05 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-oFZGZ70h.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-Bol10P1r.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-BF62yNUn.js
│  1,360.87 kB │ gzip: 392.12 kB

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

│  Vite ✓ built in 1.53s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

page.waitForSelector: Timeout 20000ms exceeded.
Call log:
[2m  - waiting for locator('body.sb-show-main, body.sb-show-errordisplay') to be visible[22m

    at openStory (/Users/brukhabtu/src/github.com/bruk-io/grocs/tools/storybook-browser.ts:172:14)
    at async main (/Users/brukhabtu/src/github.com/bruk-io/grocs/tools/visual.ts:127:28)
    at async file:///Users/brukhabtu/src/github.com/bruk-io/grocs/tools/visual.ts:186:20 {
  log: [
    "  - waiting for locator('body.sb-show-main, body.sb-show-errordisplay') to be visible"
  ],
  name: 'TimeoutError'
}

Node.js v24.22.0
/Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui:
[ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL] @grocs/ui@0.0.0 visual: `node ../../tools/visual.ts -- --no-build`
Exit status 1
```

Review (philosophy:reviewer, 2026-11-06): all five criteria met and ticked. #1-#4 are answered in decision-15 (accepted), and #5 by filing TASK-74.6. The decision's repo claims were checked and hold: import-layers.ts keys its table by layer only, so app may import any provider (unitOf already names the app). core-purity covers only packages/core/src. No app imports providers-server; the one mention is a comment in providers-firebase/src/kitchen-gateway.emulator.test.ts. The kitchen-gateway shape (port, providers-firebase client, providers-server work, callables in apps/functions/src/index.ts) is as described. Full-tier check: the visual step failed with a Storybook openStory timeout (tools/visual.ts). Visual baselines are compared on Linux only, and this task changed no code, so it does not bear on this design task. NOT CLOSED: board-check close reports the task file has never been committed, and this review may not commit (fix/invite-preview belongs to another session). To close: commit the TASK-74 board files on main, then run close-task TASK-74.1. Findings, none filed: (low) decision-15 remembers 'unreachable' for a day, so a transient outage blocks a URL for 24h; the decision accepts this in Consequences.
<!-- SECTION:NOTES:END -->
