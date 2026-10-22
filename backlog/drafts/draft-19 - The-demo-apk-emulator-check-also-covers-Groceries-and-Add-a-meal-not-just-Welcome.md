---
id: DRAFT-19
title: >-
  The demo-apk emulator check also covers Groceries and Add a meal, not just
  Welcome
status: Draft
assignee:
  - '@claude'
created_date: '2026-10-22 19:41'
labels: []
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Follow-up split from DRAFT-15/the task it becomes: that work covers only Welcome, which tools/demo-smoke.sh already reaches with no navigation needed. Groceries (after tapping "Try the demo") and Add a meal (reached from Plan, via a day's "plan a meal" affordance - the exact WeekList locator for that slot was not found during DRAFT-15's investigation) need coordinate-tap navigation: parse a control's bounds out of a uiautomator dump, adb shell input tap its center, wait for the next screen's known text, dump/screenshot that.

## Affected users and systems
tools/demo-smoke.sh, .github/workflows/demo-apk.yml.

## Open questions
- [ ] What is the accessible text/locator for the WeekList day-slot control that reaches Add a meal (go.addMeal, wired through MealPlanTemplate -> WeekList -> onPlan)?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The emulator job screenshots and uiautomator-dumps Groceries (after tapping Try the demo) and Add a meal (after tapping a day's plan-a-meal slot), uploading all three screens' screenshots
- [ ] #2 Each of the three screens asserts at least one of its own named controls does not overlap the navigation bar inset
<!-- AC:END -->
