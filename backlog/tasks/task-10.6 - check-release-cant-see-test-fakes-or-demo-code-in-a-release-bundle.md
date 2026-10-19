---
id: TASK-10.6
title: 'check:release can''t see test fakes or demo code in a release bundle'
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 15:52'
labels:
  - size-2
  - testing
dependencies: []
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found by the TASK-10.3 builder (Oct 19, 2026). tools/release-bundle.ts DEV_ONLY_PATH matches apps/mobile/src/dev/, .rnstorybook/, packages/*/src/testing/ and test, spec and story files. The fakes live at packages/ports/src/auth/fake.ts, sync-store/fake.ts and test-support.ts, so a fake reaching a real release bundle passes unnoticed (R49, R53). After decision-12 the demo variant ships a demo composition and packages/providers-memory, and neither may reach the real release bundles.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 check:release fails when a test fake, a contract suite, the demo composition or the in-memory provider is in a real release bundle, and each failure names the rule and why
- [ ] #2 Like the existing dev-code self-check, it proves it can see each pattern, so a pattern that matches nothing fails rather than passing blind
- [ ] #3 Tests cover each new pattern, and the real release bundles pass today
<!-- AC:END -->
