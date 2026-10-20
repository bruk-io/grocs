---
id: TASK-13
title: 'Motion check: the reduced kitchen must be on the page to count as still'
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 13:41'
updated_date: '2026-10-20 03:20'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. tools/storybook-browser.ts: add to MotionReading, after travel: /** Elements inside #storybook-root when it was read; a story that rendered nothing has none. */ readonly elements: number;
2. Same file: add after MIN_PAN_TRAVEL_PX: /** The kitchen scene draws dozens of elements; fewer than this means the scene did not render, so 'still' would prove nothing (TASK-13). */ export const MIN_SCENE_ELEMENTS = 10;
3. Same file, in readMotion's page.evaluate: change the returned object to { drifting, sidewaysAnimations, travel, elements: elements.length }.
4. Same file, in judgeMotion's 'still' branch: before the existing return, add: if (reading.elements < MIN_SCENE_ELEMENTS) return [`the reduced story drew ${reading.elements} elements, fewer than ${MIN_SCENE_ELEMENTS}, so there is no scene to hold still; a story that renders nothing must not pass as reduced (R41, R60)`]; Leave the 'pans' branch unchanged.
5. tools/storybook-browser.test.ts: add elements: 40 to each of the three fixtures (panning, bobbingOnly, still) and to the inline reading in 'rejects a wobble shorter than a pan'. Change no existing expectation and delete no test.
6. Same file: add a test 'rejects a reduced story that drew no scene' that expects judgeMotion({ drifting: 0, sidewaysAnimations: 0, travel: 0, elements: 0 }, 'still') to have length 1 and its first message to contain 'R41'. Import MIN_SCENE_ELEMENTS and add a second expectation that elements: MIN_SCENE_ELEMENTS - 1 also fails.
7. Run pnpm check, pnpm typecheck, pnpm test and pnpm --filter @grocs/ui visual (the motion check must still pass on the real Panning and Reduced stories, every baseline unchanged). If any step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026).
<!-- SECTION:NOTES:END -->
