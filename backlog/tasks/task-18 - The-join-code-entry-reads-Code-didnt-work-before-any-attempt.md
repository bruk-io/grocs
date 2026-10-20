---
id: TASK-18
title: The ui offers a neutral code-entry state for a first join attempt
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 12:34'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-1.20.2 review. JoinInviteScreen reuses InviteRetryTemplate for typed code entry at /join, so its title says "Code didn't work" and offers 'Back to my invite' when nobody has entered a code yet. A first-time joiner from Welcome's 'Open it to join' sees an error state first.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The ui offers a code-entry state with a neutral title for a first attempt, with its story and approved baseline
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 20, 2026: 'go further'). Split at acceptance: criterion 2 (the /join screen uses the new state, retry wording only after a rejection) is app-layer work, filed as its own size-1 task once this state exists. Sized 2: a new state needs its baselines approved by Bruk.

Plan (builder-ui): add a state to InviteRetryTemplate, not a new template. Prop attempt?: 'first' | 'retry' (default 'retry' = today, unchanged). 'first' shows title 'Enter your invite code', no error styling expected, and no 'Back to my invite' button. Why same template: the /join screen then flips first->retry on a rejection without remounting the field (keeps focus/typed code); a separate template would swap trees. Files: InviteRetryTemplate.tsx, .stories.tsx (FirstAttempt), .behaviour.test.tsx, new baselines via visual:update.

Report (builder-ui): InviteRetryTemplate gains attempt?: 'first' | 'retry' (default 'retry', so every existing state/baseline is unchanged). attempt='first': title 'Enter your invite code', no 'Back to my invite' button; app passes code='' and no errorMessage. State 'firstAttempt' added to INVITERETRYTEMPLATE_STATES; story FirstAttempt; behaviour test added. New baselines: templates-invite-retry--first-attempt.png, ...--first-attempt--fold-inner.png, ...--first-attempt--fold-outer.png (plus 3 manifest.json lines). pnpm check, typecheck, test, ui visual all pass.
<!-- SECTION:NOTES:END -->
