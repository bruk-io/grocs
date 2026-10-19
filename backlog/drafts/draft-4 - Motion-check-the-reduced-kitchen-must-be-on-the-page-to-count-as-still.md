---
id: DRAFT-4
title: 'Motion check: the reduced kitchen must be on the page to count as still'
status: Draft
assignee: []
created_date: '2026-10-19 13:41'
labels:
  - size-1
  - testing
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From the review of TASK-1.37.10. judgeMotion(reading, 'still') passes when drifting and sidewaysAnimations are both 0, which is also what readMotion returns when #storybook-root has nothing animatable in it: a Reduced story that renders an empty or collapsed scene without throwing passes the still check vacuously (openStory only fails on page errors or Storybook's error display). The Panning half cannot pass by accident (it needs a running sideways animation of at least 50 px), so this only affects the reduce-motion proof (R41, R60). Evidence: tools/storybook-browser.ts readMotion and judgeMotion at b30d215. Lives in tools/, not the ui layer.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The still check also requires that the scene is present, so an empty or collapsed Reduced story fails it
- [ ] #2 A unit test shows an empty reading fails the still check
<!-- AC:END -->
