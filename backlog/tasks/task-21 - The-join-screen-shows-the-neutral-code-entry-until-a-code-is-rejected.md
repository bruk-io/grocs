---
id: TASK-21
title: The /join screen shows the neutral code entry until a code is rejected
status: To Do
assignee: []
created_date: '2026-10-20 17:39'
labels:
  - size-1
  - layer-app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-18 delivered InviteRetryTemplate attempt='first' (no inviter, errorMessage or onBack). apps/mobile/src/screens/JoinInviteScreen.tsx still passes inviter always and typechecks as a retry, so a first-time joiner from Welcome's 'Open it to join' still sees 'Code didn't work' and 'Back to my invite' before typing anything. Split from TASK-18 at acceptance as the app half; it was promised as its own size-1 task and was never filed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 JoinInviteScreen renders attempt='first' before any code is checked and switches to the retry state only after a rejection, keeping the typed code and focus, shown by a route test
<!-- AC:END -->
