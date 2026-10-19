---
id: DRAFT-7
title: The demo's Welcome screen leads with a Google button that does nothing
status: Draft
assignee: []
created_date: '2026-10-19 19:03'
labels:
  - size-2
  - layer-app
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen in run 39301929518's smoke-output welcome.png (TASK-10.4). In the demo APK, 'Continue with Google' is the full-width primary button but does nothing in the demo, while the demo's only way in, 'Try the demo', is a small left-aligned text link under 'Got an invite?'. A friend who installs the demo will tap the big button first and think the app is broken.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 In the demo variant, 'Try the demo' is the Welcome screen's primary action
- [ ] #2 In the demo variant, no control on Welcome looks actionable but does nothing (Google sign-in and invite are hidden or plainly marked unavailable)
- [ ] #3 The real build's Welcome screen is unchanged (route test)
<!-- AC:END -->
