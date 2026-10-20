---
id: TASK-18
title: The ui offers a neutral code-entry state for a first join attempt
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 11:35'
updated_date: '2026-10-20 17:14'
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

Rework (builder-ui, after Bruk saw the screenshots: 'fix the copy first'). Plan: the first attempt is someone who chose to join, so no name is known and nothing failed. InviteRetryTemplate props become a union on attempt (as SignInTemplate did for primary mode, TASK-12): attempt:'first' accepts only code, onCodeChange, onCheck, checking (inviter, errorMessage, onBack are ?: never); attempt?:'retry' keeps inviter (required), errorMessage, onBack. First: label 'Invite code' (was 'Invite code from Bruk'), placeholder 'MOREL-42' (the code's shape), no 'Not expecting this? You can ignore it.' footer (kept on retry, where the person may not have expected the invite). Title and no-back-button unchanged. Files: InviteRetryTemplate.tsx/.stories.tsx/.behaviour.test.tsx; Invalid story now carries inviter and errorMessage in its own args, so its baselines are unchanged.

Report (builder-ui, rework): final API for the app half. <InviteRetryTemplate attempt="first" code onCodeChange onCheck? checking? /> for typed entry before any attempt (no inviter, errorMessage or onBack: the type refuses them). After a rejection render <InviteRetryTemplate inviter errorMessage onBack? ... /> (attempt omitted or 'retry'); both are the same component at the same tree position so the field keeps focus and the typed code when the app flips. Today's apps/mobile JoinInviteScreen passes inviter always and typechecks as a retry; the app task must pass attempt='first' until a rejection. First-attempt copy: title 'Enter your invite code', label 'Invite code', placeholder 'MOREL-42', no footer. Baselines changed (regenerated, same three names as before): packages/ui/visual-baselines/templates-invite-retry--first-attempt.png, ...--first-attempt--fold-inner.png, ...--first-attempt--fold-outer.png, plus 3 manifest.json lines. None added or removed; every other baseline unchanged (visual: 322 views compared clean). pnpm check, typecheck, test (794) pass.

Baselines approved by @bruk on Oct 20, 2026, in the second round ('Approve both'), after the first round's 'fix the copy first' (TASK-18) and 'hide them instead' (TASK-19). The visual baselines workflow (run 39458891270, on 3c015fe pushed as task-18-19-ui) wrote 324 files byte-identical to this branch's packages/ui/visual-baselines, so the four hand-removed, never-approved files from the first attempt match what a full visual:update retires.
<!-- SECTION:NOTES:END -->
