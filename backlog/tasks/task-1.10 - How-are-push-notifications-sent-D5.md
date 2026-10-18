---
id: TASK-1.10
title: How are push notifications sent? (D5)
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 23:26'
labels:
  - size-2
  - architecture
milestone: m-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-4 -
    Push-an-activity-trigger-sends-through-FCM-to-the-partners-opted-in-devices.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D5 in doc-1: the Cloud Function, its trigger, and how it respects each member's setting (R24).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-4 on 2026-10-18, from research. Waiting on Bruk: accepting it, and whether the notification body may name the item (it passes through FCM and APNs and shows on the lock screen).

Bruk answered on 2026-10-18: push notifications may name the item or meal. Recorded in decision-4 and as a resolved area of concern in doc-1. The decision itself is still waiting on his acceptance.

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
│  Vite ✓ built in 459ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Reviewed by philosophy:reviewer. Verdict: closed.

Criterion #1 "Decision recorded" is met. decision-4 ("Push: an activity trigger sends through FCM to the partner's opted-in devices") exists at backlog/decisions/decision-4 - Push-an-activity-trigger-sends-through-FCM-to-the-partners-opted-in-devices.md with status: accepted, and it is the file this task's References field points at. It answers D5 end to end: the onDocumentCreated trigger on the activity record, FCM HTTP v1 through the Admin SDK, @react-native-firebase/messaging plus react-native-permissions on the phone, the per-member push.enabled gate with the OS prompt only on opt-in (R24), the ports/core/application/providers split (R26, R28), and an emulator-only RecordingPushSender so the end-to-end flow runs without Docker or production data (R52). It also considers and rejects the alternatives it had to weigh, and lists its sources.

Check: full tier, pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook, exited 0. Output is recorded above. The check reformatted or fixed nothing: after it ran, the only working-tree change was this task file (record-check's own notes), plus an untracked mise.toml that predates this review.

Findings, none of which blocks the close and none of which became a draft:
- The task's earlier note ends "The decision itself is still waiting on his acceptance." That is now stale: Bruk accepted it on 2026-10-18. These notes carry the correction rather than rewriting his report.
- decision-4 assumes document paths that D4 owns (kitchens/{kitchenId}/activity/{activityId} with actorUid, kind, subject; the members and devices documents), and D4's decision is still proposed. A real dependency, but the decision discloses it in its Consequences and bounds the blast radius to the trigger path and the schema, so it needs no task of its own. It will be re-read when D4 lands, before TASK-1.29 is built.
- decision-4 notes FCM has no emulator, so the first real delivery on each platform is a manual check from a development build against a separate dev Firebase project. That is work TASK-1.29 carries, not a gap here.
- Two items are left explicitly open by R24 and recorded as such: quiet hours, and notifying on edits, ticks or removals. Out of scope for this design, so no draft.

No git or environment anomaly appeared: no core.bare, no work-tree error, and no worktree involved. TASK-1's Open questions section holds no D5 line, so nothing there is left to settle.

The tick, the recorded check output and this status change are uncommitted on main; the orchestrator owns that commit.
<!-- SECTION:NOTES:END -->
