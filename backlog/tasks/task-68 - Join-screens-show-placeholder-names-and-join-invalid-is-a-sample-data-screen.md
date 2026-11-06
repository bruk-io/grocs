---
id: TASK-68
title: 'Join screens show placeholder names, and /join-invalid is a sample-data screen'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 23:18'
updated_date: '2026-11-06 23:48'
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
- [ ] #1 Opening an invite link names the person who sent it and their kitchen, or neither, never a made-up name
- [ ] #2 No route renders the join screens on sample data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06, branch feat/remove-sample-content (c66046b). Evidence: pnpm check (16 checks, incl. the new sample-data check, which flags the pre-change PlanScreen), typecheck, pnpm test (135 files, 1735 tests); route tests assert the real data and the absence of the sample; pnpm e2e --android emulator-5554 --ios 9EB5207C-C6E9-4EF9-807C-D5519575A9DB: 'e2e: every flow passed', including sign-in.yaml now asserting 'alex@grocs.test · Home'. Invite links carry from= and kitchen= (the sender's name and kitchen); JoinInviteScreen shows them, or 'Your partner' / 'their kitchen'. /join-invalid and JoinInviteInvalidScreen removed; their route tests now drive the real /join rejection, and the mascot check covers /join?code= instead.
<!-- SECTION:NOTES:END -->
