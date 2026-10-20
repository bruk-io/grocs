---
id: TASK-19
title: InviteCard disables Share link and Copy code until there is something to share
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 12:11'
updated_date: '2026-10-20 17:14'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan (builder-ui): InviteCard: a button whose handler is missing renders disabled (Button disabled), never dead. To keep every existing baseline unchanged, Waiting/Joined/Unsent/Rest stories get handlers in their own args (they render as today); the existing Unsent story means 'ready, not yet sent' and stays enabled. New state 'unshareable' (story Unshareable, no handlers) shows both buttons disabled. KitchenSetupTemplate forwards handlers already, so omitting them shows the card disabled: add state 'inviteUnavailable' + story InviteUnavailable, Rest gets handlers in args. Behaviour tests for both; baselines via visual:update. Conflict noted: AC1 says 'unsent state disabled' but the existing Unsent baseline must not change, so the disabled state is a new named state.

Report (builder-ui): InviteCard disables Share link / Copy code when onShare / onCopy is missing (never dead). New InviteCard state 'unshareable' (story Unshareable). KitchenSetupTemplate state 'inviteUnavailable' (story InviteUnavailable): omit onShare/onCopy and the card shows disabled; no new prop. Existing stories now pass handlers in their own args so every existing baseline is byte-unchanged; the existing Unsent story still means ready-but-unsent (enabled). New baselines: organisms-invitecard--unshareable.png; templates-kitchen-setup--invite-unavailable.png, --fold-inner.png, --fold-outer.png (plus manifest.json lines). check, typecheck, test, ui visual all pass.

Rework (builder-ui, after Bruk saw the screenshots: 'hide them instead'). Plan: before a code exists Share link and Copy code are not rendered, and the code box shows a hint instead of a sample code. Type level: InviteCard code is string | null; code:null refuses status, onShare, onCopy (?: never). KitchenSetupTemplate inviteCode is string | null, null refuses inviteStatus, onShare, onCopy. InviteCode atom gains a 'pending' state: a hint prop instead of code (union), new story Pending. Hint copy: 'Your code appears after Start planning.' Renames: InviteCard 'unshareable'/Unshareable -> 'noCode'/NoCode; KitchenSetupTemplate 'inviteUnavailable'/InviteUnavailable -> 'noInviteYet'/NoInviteYet. Never-dead rule kept where a code exists: a missing handler on one button renders that button disabled (Button disabled), the other stays live; tested on InviteCard and the template. The superseded Unshareable/InviteUnavailable baselines (4 files, from the earlier attempt, never approved) are removed.

Report (builder-ui, rework): final API for the app half. <KitchenSetupTemplate inviteCode={string | null} .../>: inviteCode={null} before Start planning shows the hint and no Share link or Copy code, and accepts no inviteStatus, onShare or onCopy; with a string code, inviteStatus?, onShare?, onCopy? as before. KitchenSetupScreen should pass inviteCode={created?.inviteCode ?? null} (drop the '- - - -' placeholder) and keep onShare only in the created branch; HouseholdScreen (sample data, passes a code but no handlers) now shows both buttons disabled and needs onShare/onCopy or inviteCode={null}. A missing handler with a code present: that button renders disabled (aria-disabled, no press), the other stays live; so today's KitchenSetupScreen, which gives onShare but no onCopy, shows Copy code disabled until it passes onCopy (TASK-17). Baselines added: packages/ui/visual-baselines/organisms-invitecard--no-code.png, templates-kitchen-setup--no-invite-yet.png (+ --fold-inner, --fold-outer), atoms-invitecode--pending.png. Removed (the unapproved earlier attempt): organisms-invitecard--unshareable.png, templates-kitchen-setup--invite-unavailable.png (+ --fold-inner, --fold-outer). Changed: none; manifest.json lines added and removed to match; every other baseline unchanged (visual: 323 views compared clean). pnpm check, typecheck, test, ui visual pass.

Baselines approved by @bruk on Oct 20, 2026, in the second round ('Approve both'), after the first round's 'fix the copy first' (TASK-18) and 'hide them instead' (TASK-19). The visual baselines workflow (run 39458891270, on 3c015fe pushed as task-18-19-ui) wrote 324 files byte-identical to this branch's packages/ui/visual-baselines, so the four hand-removed, never-approved files from the first attempt match what a full visual:update retires.
<!-- SECTION:NOTES:END -->
