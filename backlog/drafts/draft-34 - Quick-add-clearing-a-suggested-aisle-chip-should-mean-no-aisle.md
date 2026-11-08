---
id: DRAFT-34
title: 'Quick add: clearing a suggested aisle chip should mean no aisle'
status: Draft
assignee: []
created_date: '2026-11-08 22:47'
labels:
  - layer-app
  - layer-application
  - size-1
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-1.22's reviews. Deselecting a suggested chip sends no aisle, so AddItem's memory lookup still files the item under the remembered aisle while the screen showed none selected. Choosing Other is the workaround.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After a person clears a suggested chip and adds, the item is not filed under the remembered aisle, shown by a route test
<!-- AC:END -->
