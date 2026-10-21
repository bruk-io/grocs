---
id: DRAFT-18
title: >-
  Visual: let a template story choose its viewports, so inner-layout stories
  stop producing squeezed phone/outer baselines
status: Draft
assignee: []
created_date: '2026-10-21 16:58'
labels:
  - size-1
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
tools/storybook-browser.ts viewportsFor picks viewports by title only (Templates/ -> phone, fold-outer, fold-inner). TASK-1.31.1's inner-layout GroceryListTemplate stories (InnerGroceries, InnerFiltered, InnerEmptyMeal, InnerNoMeals) therefore also have 8 baselines at phone and fold-outer widths showing a squeezed 224 dp rail, a state the app never shows (TASK-1.31.2 switches layout at 600 dp). Every rail change will churn them and ask Bruk to approve noise.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A story can declare the viewports it is shot at (e.g. a parameters field), defaulting to today's title rule
- [ ] #2 Inner-layout stories are shot at fold-inner only and their 8 phone/fold-outer baselines are retired
<!-- AC:END -->
