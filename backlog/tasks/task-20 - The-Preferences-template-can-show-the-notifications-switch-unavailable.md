---
id: TASK-20
title: The Preferences template can show the notifications switch unavailable
status: In Progress
assignee:
  - '@builder-ui'
created_date: '2026-10-20 17:34'
updated_date: '2026-10-20 19:00'
labels:
  - size-2
  - layer-ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-1.28 builder. PreferencesTemplate has no way to draw its notifications switch disabled, so until push opt-in exists (TASK-1.29) Settings shows a switch that looks live and does nothing - the dead-control problem TASK-12, TASK-17 and TASK-19 removed elsewhere. TASK-1.28's criterion 1 waits on this.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PreferencesTemplate can show the notifications switch unavailable (disabled, with a short reason), as a state with its story and behaviour test, and its switch is never live without a handler
- [ ] #2 Every existing baseline is unchanged and the new baselines are approved
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Make PreferencesTemplate's notifications switch a two-shape union (live: notificationsOn + required onNotificationsChange; unavailable: notificationsUnavailable reason string, disabled, off). Add 'unavailable' to PREFERENCESTEMPLATE_STATES, an Unavailable story, a behaviour test. Rest drawn unchanged. Approve new baselines via visual:update.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built. PreferencesTemplate props are now NotificationsSwitch (live: notificationsOn + required onNotificationsChange | unavailable: notificationsUnavailable: string, switch drawn off and disabled, reason shown under the label) & the rest. Story Unavailable, test added, states list has 'unavailable'. Existing baselines unchanged; added templates-preferences--unavailable{,--fold-inner,--fold-outer}.png + manifest.json. pnpm check, typecheck, test (1335 passed), visual (318 compared) all pass.

Baselines approved by @bruk on Oct 20, 2026 ('Approve'), after seeing templates-preferences--unavailable.png. The visual baselines workflow (run 39472613507, on 8e1aa5a pushed as task-20-ui) wrote 319 files byte-identical to this branch's packages/ui/visual-baselines.
<!-- SECTION:NOTES:END -->
