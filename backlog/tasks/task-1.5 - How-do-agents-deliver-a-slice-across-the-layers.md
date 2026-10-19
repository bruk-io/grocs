---
id: TASK-1.5
title: How do agents deliver a slice across the layers?
status: Done
assignee: []
created_date: '2026-10-18 17:39'
updated_date: '2026-10-19 00:29'
labels:
  - size-1
milestone: m-1
dependencies: []
references:
  - >-
    backlog/decisions/decision-3 -
    Agent-workflow-an-orchestrator-and-per-layer-agents-deliver-each-slice.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Answers Bruk's question on agent workflow (layer-scoped agents, orchestration, roles, models and efforts) under doc-1. Shapes how R26, R27 and R55 to R58 are applied to the agents themselves. Decided by Bruk on Oct 18, 2026; see decision-3.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
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
│  Vite ✓ built in 488ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Closed. Criterion #1 (Decision recorded) is met: decision-3 'Agent workflow: an orchestrator and per-layer agents deliver each slice' exists at backlog/decisions/decision-3, status accepted, and is the file this task's References field names. It answers D5 (layer-scoped agents, orchestration, roles, pinned models and efforts) and is already applied in the repo (18 generated agents under .claude/agents/, tools/agents/template.md and configs, the launch guard in tools/hooks/launch-guard.ts, the agent-definitions check).

Full check tier run and recorded above: pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook exited 0. It fixed or reformatted nothing; git status after the run showed only this task's own notes plus a pre-existing untracked mise.toml that predates the review.

Findings, none blocking this close:
- Medium: decision-3's Enforcement section specifies a pre-edit hook that blocks layer-boundary writes, and that enforcement is not currently in force. tools/hooks/pre-edit.ts is built and tested but its .claude/settings.json registration was removed on 2026-10-18 over a false-positive in reviewBash's ask path (ordinary redirects such as 2>&1 read as loosening check/CI config). Nothing presently stops an agent writing outside its layer. Not filed as its own draft: TASK-1.18 ('Generate the layer agents and the launch hook', ac 0/4) is the queued task in this area, and the re-registration plus the reviewBash redirect fix belong there.
- Low: no D5 checkbox exists under TASK-1's Open questions (its four open lines are all unrelated carried-forward items), so there is no parent question for this close to tick. If the intent is meant to track the design questions as checkboxes, that is for whoever owns TASK-1's finish line.
- Note: mise.toml is untracked at the repo root and was untracked before this review. Left alone.
<!-- SECTION:NOTES:END -->
