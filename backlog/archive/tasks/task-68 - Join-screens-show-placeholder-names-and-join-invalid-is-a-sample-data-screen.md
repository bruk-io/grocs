---
id: TASK-68
title: 'Join screens show placeholder names, and /join-invalid is a sample-data screen'
status: Done
assignee:
  - '@claude'
created_date: '2026-11-06 23:18'
updated_date: '2026-11-07 00:09'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the 2026-11-06 sample-content sweep. Opening an invite link shows 'Your partner invited you to Our kitchen' whoever sent it and whatever the kitchen is called: JoinInviteScreen hardcodes both. The joiner is not a member yet, so the app cannot read the kitchen. /join-invalid (JoinInviteInvalidScreen) is a design-reference screen on sample data (Alex, MOREL-42) that nothing links to; the real rejected state is drawn by JoinInviteScreen itself.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Opening an invite link names the person who sent it and their kitchen, or neither, never a made-up name
- [x] #2 No route renders the join screens on sample data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. Invite links carry from= and kitchen= (the sender's name and kitchen); JoinInviteScreen shows them, or 'Your partner' / 'their kitchen'. /join-invalid and JoinInviteInvalidScreen removed; their route tests now drive the real /join rejection, and the mascot check covers /join?code= instead.

No repro: the bug is static content visible in the pre-change source, which I read at HEAD~1 (aa220b8~1): JoinInviteScreen.tsx lines 68-69 hardcode inviter="Your partner" kitchen="Our kitchen", and app/join-invalid.tsx rendered JoinInviteInvalidScreen on sample data (Alex, MOREL-42). No failing test was committed before the fix.

Closed by review. Full check (record-check --tier full) passed, exit 0, at aa220b8, recorded on TASK-57 (one commit covers all four); nothing reformatted. /join-invalid and its sample screen are deleted; route tests cover the named and unnamed link and the wrong-code state. Findings (low, not filed): from= and kitchen= are free text in the link, so anyone forwarding or crafting a link can put any name there; the code is still the only thing that grants entry, so the risk is mild social engineering. Invites shared from KitchenSetupScreen carry the kitchen but not the inviter's name, so they read 'Your partner invited you to <kitchen>'.
<!-- SECTION:NOTES:END -->
