---
id: TASK-1.14
title: How is Storybook set up? (D9)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 23:34'
labels:
  - size-2
  - design-system
milestone: m-1
dependencies:
  - TASK-1.4
references:
  - >-
    backlog/decisions/decision-10 -
    Storybook-setup-our-token-script-SVGR-with-checked-in-output-two-release-guards.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D9 in doc-1: token generation, story conventions for every component state (R61), excluding the on-device route from release, SVG conversion for icons and mascots (R62), hosting the browser build (R59 to R66). Storybook is decided (decision-2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-10 on 2026-10-18. The Cloudflare hosting path for Shazya is unverified. Waiting on Bruk to accept.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook` exited 0

(155 earlier lines omitted)
```text
│  option. You can remove the plugin and set resolve.tsconfigPaths: true
│  in your Vite config instead.
│  Vite vite v8.3.4 building client environment for production...
transforming...
✓ 302 modules transformed.
rendering chunks...
computing gzip size...
│  Vite storybook-static/iframe.html                              18.66
│  kB │ gzip:   5.27 kB
│  storybook-static/assets/iframe-Dz6ySFS4.js                 0.04 kB │
│  gzip:   0.06 kB
│  storybook-static/assets/Badge.stories-Bw1bWDLG.js          0.28 kB │
│  gzip:   0.23 kB
│  storybook-static/assets/Checkbox.stories-CWKP0SXZ.js       0.50 kB │
│  gzip:   0.32 kB
│  storybook-static/assets/Text.stories-JiK2ywtu.js           0.57 kB │
│  gzip:   0.34 kB
│  storybook-static/assets/Badge-DAi34iyw.js                  0.85 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/Text-BnbgowVj.js                   1.05 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/rolldown-runtime-BCiCTKAo.js       1.30 kB │
│  gzip:   0.71 kB
│  storybook-static/assets/preload-helper-DQzUoscV.js         1.64 kB │
│  gzip:   0.87 kB
│  storybook-static/assets/Button.stories-CesRtrie.js         2.43 kB │
│  gzip:   1.12 kB
│  storybook-static/assets/Checkbox-CqMRbPVr.js               2.45 kB │
│  gzip:   1.13 kB
│  storybook-static/assets/ItemRow.stories-DFwaSh4d.js        2.70 kB │
│  gzip:   1.25 kB
│  storybook-static/assets/Text-D2guw9ro.js                   3.62 kB │
│  gzip:   1.55 kB
│  storybook-static/assets/react-BWPDF9mI.js                  7.87 kB │
│  gzip:   3.00 kB
│  storybook-static/assets/TextField.stories-C4QECVHX.js      8.35 kB │
│  gzip:   3.44 kB
│  storybook-static/assets/Pressable-DfI3QPHN.js             12.06 kB │
│  gzip:   4.36 kB
│  storybook-static/vite-inject-mocker-entry.js              27.81 kB │
│  gzip:   9.67 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js             211.29 kB │
│  gzip:  66.04 kB
│  storybook-static/assets/iframe-D0mY_p35.js             1,192.99 kB │
│  gzip: 342.28 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│  Vite ✓ built in 490ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Reviewed and closed. decision-10 exists, status accepted (dated 2026-10-18 19:01), and is the decision this task's References field points to; it answers D9 across all five parts the description asks for (token generation, story conventions for R61/R63/R65, excluding the on-device route from release, SVG conversion for R62, and hosting the browser build for R59-R66), and names decision-2 and decision-5 as its inputs. Criterion #1 (Decision recorded) ticked on that evidence.

Full check tier recorded above: `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook` exited 0. No files were reformatted or fixed by the run; the only working-tree change was this task file. The build-storybook step writes packages/ui/storybook-static, which .gitignore line 8 already covers.

Findings, none blocking the close:
- Low: the decision's own Consequences record that the Cloudflare hosting path (the workers repo's Google gate in front of an assets-only worker, and the cross-repository artifact download) is unverified, with Cloudflare Access named as the fallback. Carried by the decision, no task filed.
- Low: the implementation work decision-10 commits to has no task beyond TASK-1.19 (tokens and art from the retired canvas). On-device Storybook (R64, the .rnstorybook config, the guarded route and check:release marker), tools/build-svg.ts with the svg/generated-in-sync check, the story-coverage/interactive-states rule, and the hosting workflow are unscheduled. Left for the orchestrator to slice rather than filed as a draft, since it is planning and not a defect.
- Informational: the pre-close note said "Waiting on Bruk to accept"; that is now stale and superseded by the accepted status.
No drafts filed.
<!-- SECTION:NOTES:END -->
