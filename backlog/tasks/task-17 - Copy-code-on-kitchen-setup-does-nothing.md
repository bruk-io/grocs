---
id: TASK-17
title: Copy code on kitchen setup does nothing
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 12:43'
labels:
  - size-2
  - layer-app
  - finish-moved
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.20.2 review. KitchenSetupScreen passes onShare but no onCopy, so InviteCard renders 'Copy code' as a full-size button that does nothing once a kitchen is made (no clipboard module is installed; the builder noted it). Same class of problem as TASK-12: a control that looks live but is dead, and the code is the one thing a partner needs. Before the kitchen exists, Share link and Copy code are both rendered with no handler beside a placeholder code '- - - -'.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Copy code puts the invite code on the clipboard, shown by a route test on a fake clipboard
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Resized to 2 at acceptance: it adds expo-clipboard, a native module, and a clipboard seam on the app composition that route tests can fake. decision-8 already names expo-clipboard for the diagnostics copy (TASK-1.28), so this lays the shared piece.

Oct 20, 2026 (orchestrator): the builder stopped before editing because criterion 2 needs a ui change (TASK-19). Split by order, not by task: this task builds criterion 1 now (expo-clipboard, the copyText seam, Copy code once a kitchen exists, a route test on a fake clipboard) and comes back for criterion 2's route test once TASK-19 merges.

Plan (builder-app, criterion 1 only): add expo-clipboard ~58.0.3 to apps/mobile (lockfile diff checked for scope and build scripts); App.copyText(text): Promise<void> required on AppOptions, passed through composeFirebaseApp and composeDemoApp; native.ts and demo/index.ts wire expo-clipboard setStringAsync; FakeClipboard in apps/mobile/testing, passed by appOnFakes; KitchenSetupScreen passes onCopy once a kitchen exists; route test in kitchen.route.test.tsx. Criterion 2 untouched.

Criterion 1 built (builder-app): expo-clipboard ~58.0.3 added (lockfile diff is the one package, no build script, allowBuilds untouched). App.copyText is a required seam on AppOptions, composeFirebaseApp and composeDemoApp; native.ts and the demo entry wire setStringAsync. FakeClipboard in apps/mobile/testing, returned by appOnFakes as .clipboard. KitchenSetupScreen passes onCopy once a kitchen exists. Route test 'puts the invite code on the clipboard when Copy code is pressed' in kitchen.route.test.tsx. Ran: pnpm check, typecheck, test (1332 passed), check:release, check:demo, all clean. Criterion 1 left unticked for the reviewer; criterion 2 waits on TASK-19; task stays In Progress.

Finish line moved by the orchestrator (Oct 20, 2026): criterion 2 (Share link and Copy code disabled or hidden before a kitchen exists) moved to TASK-20, which follows TASK-19's ui change. Reason: the clipboard seam built here is what TASK-1.28's diagnostics copy needs, and holding it for an unrelated ui change would block that. Dependency on TASK-19 dropped with it.

Correction: the moved criterion is TASK-1.20.4 (filed under TASK-1.20), not TASK-20.
<!-- SECTION:NOTES:END -->
