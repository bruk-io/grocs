---
id: TASK-19
title: InviteCard disables Share link and Copy code until there is something to share
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 12:11'
updated_date: '2026-10-20 12:59'
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
<!-- SECTION:NOTES:END -->
