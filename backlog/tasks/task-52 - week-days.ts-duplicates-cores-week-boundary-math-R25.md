---
id: TASK-52
title: week-days.ts duplicates core's week-boundary math (R25)
status: To Do
assignee:
  - '@claude'
created_date: '2026-10-25 00:30'
updated_date: '2026-10-25 00:30'
labels:
  - layer-core
  - size-2
dependencies:
  - TASK-1.21.6
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by reviewer-app reviewing TASK-1.21.6: apps/mobile/src/screens/week-days.ts re-implements packages/core/src/model/week.ts's weekIdFor day-index/week-boundary math (the (((days + 3) % 7) + 7) % 7 weekday derivation) rather than importing it, putting a domain rule (R5's week boundary) in two layers. core/week.ts's own comment already flags that the kitchen-timezone version of R5 'comes with the kitchen settings' (still pending - TASK-1.9/decision-7 aren't settled), so when that lands in core, the app's hand-copied math silently diverges from what's actually displayed, and the week a meal is written to can disagree with the week the plan shows. Low urgency now (both copies agree today, covered incidentally by route tests, no direct unit test exists for either), real once core's week logic changes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 core exports the day-index/week-start primitives week-days.ts currently re-implements; week-days.ts imports them and keeps only formatting (labels, dayId strings, tone)
- [ ] #2 A direct unit test covers the shared primitive (it currently has none - only incidental route-test coverage)
<!-- AC:END -->
