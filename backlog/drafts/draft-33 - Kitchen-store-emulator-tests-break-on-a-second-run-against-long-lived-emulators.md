---
id: DRAFT-33
title: >-
  Kitchen store emulator tests break on a second run against long-lived
  emulators
status: Draft
assignee:
  - '@claude'
created_date: '2026-11-07 05:07'
labels:
  - size-1
  - providers
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
packages/providers-server/src/kitchen-store.emulator.test.ts uses a fixed kitchen id, so a second run of the emulator project against one running pnpm emulators instance fails on the first run's documents. Same shape as TASK-74.4.10 (fixed for the recipe cache tests with a run-unique id). Found by philosophy:reviewer closing TASK-74.4.10 on 2026-11-07; predates TASK-74.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 kitchen-store.emulator.test.ts uses ids unique to the run, and running the emulator project twice against one long-lived emulator instance passes both times
<!-- AC:END -->
