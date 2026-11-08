---
id: DRAFT-35
title: Header avatars show a member's uid when the kitchen has no name for them
status: Draft
assignee: []
created_date: '2026-11-08 22:47'
labels:
  - layer-app
  - size-1
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-1.22.9's review. avatarsFor in use-kitchen-info.ts draws a member's name, and gateways fall back to memberNames[uid] ?? uid, so a nameless member's uid appears as their name. GroceriesScreen's nameOf already treats that as unknown for rows; a route test records the header's behaviour.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A member whose name equals their uid shows no uid in the header avatars, by route test
<!-- AC:END -->
