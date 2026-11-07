---
id: TASK-70
title: The join screen trusts names in the invite link
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 00:14'
labels:
  - size-2
  - app
  - providers
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-68's review, Bruk 2026-11-06: 'close it off'. TASK-68 put the sender's name and kitchen in the invite link (from=, kitchen=) and the join screen shows them, so anyone who edits or forges a link can make the screen name a sender and kitchen that are not real. Chosen fix: the join screen asks the server for the invite's real kitchen and owner by code, and never reads names from the link. The lookup requires sign-in, like every kitchen function, so names are not exposed to someone guessing codes; signed out, the screen names nobody. Also: KitchenSetupScreen's share message names the kitchen but not the sender (TASK-68 review finding 2).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The join screen never shows a name taken from the link
- [ ] #2 A signed-in person opening a valid invite sees the real sender and kitchen, from the server
- [ ] #3 An invalid or used code, or a signed-out person, sees no names
- [ ] #4 The share message from kitchen setup names the sender, as Household's does
<!-- AC:END -->
