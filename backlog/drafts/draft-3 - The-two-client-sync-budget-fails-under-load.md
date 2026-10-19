---
id: DRAFT-3
title: The two-client sync budget fails under load
status: Draft
assignee: []
created_date: '2026-10-19 12:40'
labels:
  - testing
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the TASK-1.39 review: with several agents running checks at once, the emulator two-client test took 4.7 s against its 3 s sync budget (R-cited in the test). It passes alone. Same class as TASK-1.42: a time budget that a loaded machine overruns, which teaches people to re-run red checks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The two-client test separates what it promises (an item reaches the other client) from how fast, so load cannot fail the first, and the speed budget is measured where it means something
- [ ] #2 The decision on the speed budget is Bruk's and is recorded on the task
<!-- AC:END -->
