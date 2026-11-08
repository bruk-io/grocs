---
id: DRAFT-32
title: >-
  The meal form shows that Save waits for an import, and a test pins the link
  field after a failed grocery add
status: Draft
assignee: []
created_date: '2026-11-08 04:05'
labels:
  - size-2
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-74.5.15's review (non-blocking). 1) While 'Get recipe and groceries' is in flight, AddMealScreen ignores Save (correct: a Save then would create a second meal, §17 step 2), but MealFormTemplate disables Save only for adding || removing, so the tap does nothing with no feedback; the import button's protection against the reverse race also lives only in the template's disabled prop. 2) After a successful import whose AddItem fan-out fails (AC#6 path), the form stays open and setLink(event.sourceUrl) is what stops a later Save from writing the raw pasted link back and detaching the recipe; no test fails if that line is removed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MealFormTemplate takes an importing state that disables Save and Remove while an import runs, with a story and a behaviour test
- [ ] #2 A route test types a link with tracking parameters, makes an AddItem fail after a successful import, and asserts the link field shows the recipe's sourceUrl and a following Save keeps meal.link === sourceUrl
<!-- AC:END -->
