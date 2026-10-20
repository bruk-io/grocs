---
id: DRAFT-11
title: Copy code on kitchen setup does nothing
status: Draft
assignee: []
created_date: '2026-10-20 11:35'
labels:
  - size-1
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
