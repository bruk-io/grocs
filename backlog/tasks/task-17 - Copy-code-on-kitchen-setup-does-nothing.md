---
id: TASK-17
title: Copy code on kitchen setup does nothing
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 12:07'
labels:
  - size-2
  - layer-app
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
- [ ] #2 Before a kitchen exists, Share link and Copy code are either hidden or disabled, not dead
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Resized to 2 at acceptance: it adds expo-clipboard, a native module, and a clipboard seam on the app composition that route tests can fake. decision-8 already names expo-clipboard for the diagnostics copy (TASK-1.28), so this lays the shared piece.
<!-- SECTION:NOTES:END -->
