---
id: TASK-1.37.9
title: >-
  UI polish from the template review: invite code font, partner halo, toast
  width, button icons
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-19 08:30'
updated_date: '2026-10-19 11:45'
labels:
  - size-2
  - layer-ui
  - design-system
milestone: m-2
dependencies: []
parent_task_id: TASK-1.37
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.37.3. Small likeness gaps against design/reference/shots: the invite code (MOREL-42) on JoinInviteInvalid is in the body font where the reference uses the display font; the partner avatar in the Main, Toast and Offline headers has a solid tomato ring where the reference has a soft halo; the toast pill is narrower than the reference; and the Button atom has no icon slot, so Share link and Copy diagnostics (Household, Settings) lose their icons.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The invite code uses the display font, the partner avatar shows a soft halo, and the toast pill width matches the reference
- [ ] #2 Button takes an optional leading icon, used by Share link and Copy diagnostics, with stories, behaviour tests and approved baselines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026 (Bruk: wrap up the UI portions).

Builder-ui report. Invite code field takes a display prop (TextField, LabelledField) set on InviteRetryTemplate so MOREL-42 is in the display font. Avatar online ring is now a soft halo (lineWStrong tomato ring at opacity.tucked plus a tomato blur). ActivityToast text is body heavy at small size, widening the pill toward the reference. Button gains leadingIcon (16px glyph before the label, dropped while loading, ignored on icon and back variants), used by InviteCard Share link (share) and PreferencesTemplate Copy diagnostics (copy). Stories LeadingIconPrimary/Secondary/Disabled/Loading and 3 behaviour tests added. Baselines: 4 new atoms-button--leading-icon-*; changed for the halo: atoms-avatar--online, atoms-avatar--xl-online, molecules-avatarstack--online, organisms-mainheader--groceries and --meal-plan, templates-grocery-list (groceries, toast, empty, all-done, offline) and templates-meal-plan--week, each with fold variants, plus manifest.json; toast width: molecules-activitytoast--rest and --planned and grocery-list--toast/groceries; invite code font: templates-invite-retry--invalid; icons: organisms-invitecard--unsent/waiting/joined, templates-kitchen-setup--rest, templates-preferences--rest. pnpm check, typecheck, test (1167) and visual all pass.
<!-- SECTION:NOTES:END -->
