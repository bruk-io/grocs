---
id: TASK-21
title: The /join screen shows the neutral code entry until a code is rejected
status: In Progress
assignee:
  - '@builder-app-small'
created_date: '2026-10-20 17:39'
updated_date: '2026-10-20 19:16'
labels:
  - size-1
  - layer-app
dependencies:
  - TASK-18
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. apps/mobile/src/screens/JoinInviteScreen.tsx: replace the final return (the single <InviteRetryTemplate inviter="your partner" ... /> element) with one that renders, when linked === null && error === undefined, <InviteRetryTemplate attempt="first" code={code} onCodeChange={setCode} checking={busy} onCheck={() => void join(code)} />, and otherwise the existing element exactly as it is now. Keep both in the same position so React keeps the field (same component type in the same slot).
2. apps/mobile/src/routes/kitchen.route.test.tsx: add a test 'opens /join with a neutral code entry, and says the code did not work only after a rejection': render ROUTES with await appOnFakes({ signedIn: true, kitchen: false }) at location '/join'; expect await screen.findByText('Enter your invite code'); expect screen.queryByText("Code didn't work") to be null; then change the textbox to 'NOPE-0000' and click the 'Check code' button; expect await screen.findByText("Code didn't work"). Change no other test.
3. Run pnpm test, pnpm check, pnpm typecheck, pnpm check:release and pnpm check:demo. If a step does not fit the code (for example the retry title's exact text differs), stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by the orchestrator (Oct 20, 2026): the app half promised when DRAFT-12 was split, which TASK-18's review found had never been filed. Rule chosen: the neutral first-attempt state shows only when the screen was not opened from an invite link and no code has been rejected yet; a link-opened entry keeps the retry shape and its Back to my invite, unchanged.

Builder report (builder-app-small, Oct 20, 2026): Step 1 done. JoinInviteScreen renders InviteRetryTemplate attempt='first' (code, onCodeChange, checking, onCheck) when linked === null and no error has been set; after a rejection, or for a link-opened entry, the existing retry element is rendered unchanged in the same slot, so the field and focus are kept. Step 2 done: route test 'opens /join with a neutral code entry, and says the code did not work only after a rejection' added after the typed-code join test; no other test changed. Note: the test asserts the title switch only; the acceptance text also says the typed code is kept, which this test does not assert. Step 3 results: pnpm test 100 files / 1347 tests pass; pnpm typecheck exit 0; pnpm check (13 checks) passed; pnpm check:release and pnpm check:demo passed.
<!-- SECTION:NOTES:END -->
