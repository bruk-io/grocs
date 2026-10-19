---
id: TASK-10.3
title: A demo build that runs on sample data with no account
status: To Do
assignee: []
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 15:52'
labels:
  - size-3
  - layer-app
dependencies:
  - TASK-10.6
  - TASK-10.8
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Oct 19, 2026: the builder stopped before editing. The demo would have needed the test fakes, which import-layers rightly keeps test-only, and check:release can't see fakes at all. Bruk chose a real in-memory provider (decision-12). This task now builds the demo composition on packages/providers-memory (TASK-10.8), and its criterion 3 relies on the stricter release check (TASK-10.6). Builder's findings for TASK-10.4: native.ts imports @react-native-firebase at the top level, so the demo must reach it only through a build-time gate (EXPO_PUBLIC_APP_VARIANT); the Firebase config plugins and googleServicesFile must be skipped in the demo variant, and Firebase may need excluding from autolinking or the app crashes at launch without google-services.json.
<!-- SECTION:NOTES:END -->
