---
id: TASK-67
title: 'Kitchen setup has no way to sign out, so a wrong account is stuck there'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-06 22:40'
updated_date: '2026-11-07 01:10'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-56 flows: kitchen setup (signed in, no kitchen) offers Start planning and, since TASK-56, Open it to join, but no Settings and no sign out. Someone who signed in with the wrong Google account, Shazya picking a work account say, cannot switch without deleting the app.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A signed-in person on kitchen setup can sign out from there
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. ui: KitchenSetupTemplate takes onSignOut and shows 'Not you? Sign out' in its footer, under the invite row, before and after the kitchen exists. Behaviour test; story arg.
2. app: KitchenSetupScreen signs out through App.signOut and goes to Welcome, as Settings does. Route test: sign out from setup lands on Welcome.
3. Visual baselines via the visual-baselines workflow, reviewed as images.
4. Full check; pnpm e2e.
<!-- SECTION:PLAN:END -->
