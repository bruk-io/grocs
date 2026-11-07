---
id: TASK-66
title: Checking an empty invite code says to check your connection
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 22:07'
updated_date: '2026-11-07 13:49'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-56 flows: Check code with an empty field dispatches JoinKitchen with '', the joinKitchen function rejects it as invalid-argument, and the join screen shows its generic 'We could not check that code. Check your connection and try again.' Nothing is wrong with the connection; the person just has not typed a code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Check code with nothing typed asks for the code and calls nothing
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fix (9141832): JoinInviteScreen.join returns before dispatching when the trimmed code is empty and shows 'Type the code from your invite first.' on the field; typing clears it. InviteRetryTemplate's first attempt now accepts errorMessage (title stays 'Enter your invite code'); new state/story MissingCode. Proof: kitchen.route.test.tsx 'asks for the code, and calls nothing...' spies on the gateway's joinKitchen and asserts it is never called; fails without the guard, passes with it. On the simulator (Pat): Check code with nothing typed shows the prompt (/private/tmp/claude-501/-Users-brukhabtu-src-github-com-bruk-io-grocs/ac56ae32-4b92-4feb-9938-4b554a7388d6/scratchpad/shots/2026-11-07_081545/verify-pat/takeScreenshot/5-missing-code.png).

Reviewed by philosophy:reviewer: not closed. AC #1 is met on the evidence (route test spies on joinKitchen and asserts no call; simulator shot 5-missing-code shows the prompt). close-task refuses: a bug closes with its repro recorded (record-check <id> --repro -- <test>, which must fail, so it has to be recorded against the pre-fix code by the worker), or a note starting 'No repro:'.
<!-- SECTION:NOTES:END -->
