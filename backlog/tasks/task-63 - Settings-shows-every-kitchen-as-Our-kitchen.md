---
id: TASK-63
title: Settings shows every kitchen as 'Our kitchen'
status: To Do
assignee: []
created_date: '2026-11-06 20:06'
labels:
  - size-1
  - app
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-62 sign-in flow: SettingsScreen hardcodes kitchen="Our kitchen" with the comment 'the app has no read of the kitchen's name yet'. That read exists now (getKitchen, TASK-27). Alex's seed kitchen 'Home' shows as 'Our kitchen'. Once fixed, e2e/sign-in.yaml should assert 'alex@grocs.test · Home' instead of matching any kitchen name.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Settings shows the signed-in member's real kitchen name
- [ ] #2 e2e/sign-in.yaml asserts the seed kitchen's name, Home
<!-- AC:END -->
