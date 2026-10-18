---
id: TASK-1.10
title: How are push notifications sent? (D5)
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 19:18'
labels:
  - size-2
  - architecture
milestone: m-3
dependencies: []
references:
  - >-
    backlog/decisions/decision-4 -
    Push-an-activity-trigger-sends-through-FCM-to-the-partners-opted-in-devices.md
parent_task_id: TASK-1
type: design
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design question D5 in doc-1: the Cloud Function, its trigger, and how it respects each member's setting (R24).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Decision recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Proposed as decision-4 on 2026-10-18, from research. Waiting on Bruk: accepting it, and whether the notification body may name the item (it passes through FCM and APNs and shows on the lock screen).

Bruk answered on 2026-10-18: push notifications may name the item or meal. Recorded in decision-4 and as a resolved area of concern in doc-1. The decision itself is still waiting on his acceptance.
<!-- SECTION:NOTES:END -->
