---
id: TASK-10.3
title: A demo build that runs on sample data with no account
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 15:43'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-10.2
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: friends install an APK and use the app without signing in. A demo variant of the app (APP_VARIANT=demo) with its own app id (io.bruk.grocs.demo) and name, so it installs beside a real build. Its composition runs on the in-memory fakes, seeded from the sample data, so Groceries, Plan and Settings work and adding and ticking items works on the phone; nothing leaves it. Welcome offers the way in (SignInTemplate's footer slot from TASK-1.37.11 is one option). The real app's release build must not carry any of it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With APP_VARIANT=demo the app config gives a distinct app id and name, and the app opens on Welcome with a way in that needs no account
- [ ] #2 In the demo, Groceries, Plan and Settings show sample data, and adding and ticking an item works, proven by route tests on the demo composition
- [ ] #3 check:release still proves the real release bundles carry no demo or fake code, and fails if they do
<!-- AC:END -->
