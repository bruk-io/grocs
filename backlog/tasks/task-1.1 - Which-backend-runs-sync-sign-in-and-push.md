---
id: TASK-1.1
title: 'Which backend runs sync, sign-in and push?'
status: Done
assignee: []
created_date: '2026-10-18 17:19'
updated_date: '2026-10-19 00:25'
labels:
  - size-1
milestone: m-1
dependencies: []
references:
  - backlog/decisions/decision-1 - Backend-Firebase-for-sync-sign-in-and-push.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Part of design question D4 in doc-1. Chooses the backend behind the ports for sign-in (R1), live sync and offline (R15, R16) and push (R24). Decided by Bruk on Oct 18, 2026; see decision-1.
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
│  Vite ✓ built in 498ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Closed. Criterion #1 (Decision recorded) met: decision-1 'Backend: Firebase for sync, sign-in and push' exists at backlog/decisions/decision-1 - Backend-Firebase-for-sync-sign-in-and-push.md, status accepted, dated 2026-10-18, and is the decision this task's References field points to. It carries Context (options weighed: Firebase vs Supabase), Decision (Firestore, Firebase Auth, Cloud Functions via @react-native-firebase native SDKs behind the R28 ports in one provider package) and Consequences. Full check tier exited 0 and changed no files.

Findings, none filed as drafts:
- Low: the task description says 'Part of design question D4 in doc-1'; the review request named D1. decision-1 itself says D4, and the requirements it cites (R1 sign-in, R15/R16 sync and offline, R24 push) match the task's own description, so the task and its decision agree and the mismatch is in the request, not the board.
- Low (informational, not this task's): mise.toml is untracked in the working tree. Unrelated to this task; left alone.
- Low (informational, pre-existing): the Storybook build in the full check warns that iframe chunk exceeds 500 kB. Pre-existing, no realistic failure path, not filed.
<!-- SECTION:NOTES:END -->
