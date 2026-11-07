---
id: TASK-70
title: The join screen trusts names in the invite link
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 00:14'
updated_date: '2026-11-07 00:52'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06 evidence (branch fix/invite-preview). Full check ('full' in .claude/checks.json) exit 0: 16 checks; 138/138 unit files (1750 tests); test:emulator 8/8 files, 108 tests incl. the two new previewInvite contract cases against the server store and the Firebase client through the Functions emulator; check:release clean; 425 story views. Route tests: a signed-in joiner opening /join?code=<real>&from=Mallory&kitchen=Fake%20kitchen sees 'Bruk invited you to' and 'Our place' from the server, and no Mallory or Fake kitchen; signed out the same link names nobody. invite-message tests: the link carries only code=; the share message names sender and kitchen, including from kitchen setup. Devices: pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed'. The first run failed add-meal and household-join on iOS: the keyboard covers the action button (TASK-73), so the flows now submit with the return key. Also fixed: demo.route.test waits for Settings' kitchen name, which loads asynchronously since TASK-63 and lost the race under a loaded run.
<!-- SECTION:NOTES:END -->
