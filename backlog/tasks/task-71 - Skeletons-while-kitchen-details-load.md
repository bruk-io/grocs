---
id: TASK-71
title: Skeletons while kitchen details load
status: To Do
assignee: []
created_date: '2026-11-07 00:14'
updated_date: '2026-11-08 19:38'
labels:
  - size-2
  - ui
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From TASK-57/58/63's review, Bruk 2026-11-06, low priority: avatars, the Settings kitchen name and the household's members are blank until getKitchenInfo answers, and stay blank with no error if it fails. Skeleton placeholders (the Skeleton atom exists) while loading, and a failed state when the read fails, would make the wait visible. Overlaps TASK-69's first item.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Avatars, the Settings kitchen line and the household members show a skeleton while loading
- [ ] #2 Each shows a failed state when the read fails
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
From TASK-69's review, 2026-11-08: when the kitchen read fails, Household shows the failed line but its title and member list are blank, and 'try again' has no control; the Failed story hides this by passing a name and a member. Treat that here under #2. Bruk delegated the call: acceptable until this task.
<!-- SECTION:NOTES:END -->
