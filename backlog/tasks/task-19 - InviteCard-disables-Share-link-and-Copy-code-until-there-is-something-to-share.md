---
id: TASK-19
title: InviteCard disables Share link and Copy code until there is something to share
status: To Do
assignee: []
created_date: '2026-10-20 12:11'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-17 builder. InviteCard always renders Share link and Copy code as live-looking buttons and leaves out onPress when a handler is missing; Button supports disabled but InviteCard never passes it. INVITECARD_STATES lists 'unsent' but nothing implements it. KitchenSetupTemplate always renders the card and forwards only onShare, onCopy, inviteCode and inviteStatus, so the app cannot avoid dead controls before a kitchen exists (TASK-17 criterion 2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 InviteCard's unsent state shows Share link and Copy code disabled (a button without its handler is disabled, never dead), with its story and behaviour test
- [ ] #2 KitchenSetupTemplate can show the card unsent; every existing state and baseline is unchanged and the new baselines are approved
<!-- AC:END -->
