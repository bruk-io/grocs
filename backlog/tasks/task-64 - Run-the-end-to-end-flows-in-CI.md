---
id: TASK-64
title: Run the end-to-end flows in CI
status: To Do
assignee: []
created_date: '2026-11-06 20:44'
updated_date: '2026-11-08 19:22'
labels:
  - size-3
  - ci
  - e2e
dependencies:
  - TASK-62
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-62 built the Maestro flows and pnpm e2e, run by hand on a Mac (fold emulator + iPhone simulator). Nothing runs them on a pull request, so a regression on a device still waits for someone to notice. CI needs a runner that can boot an Android emulator and, for iOS and the two-device pair, a macOS runner with a simulator; each needs the development build built from tools/emulator-config.ts's demo-project config and Metro serving it. The Firebase config files come from repository secrets, as release.yml does.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A pull request runs pnpm e2e on an Android emulator and fails when a flow fails
- [ ] #2 The iOS simulator and the two-device pair run in CI too, or the reason they cannot is recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
From TASK-1.23's review, 2026-11-08: the only two-device e2e run predates TASK-78.1's rewrite of subflows/sign-in.yaml, so rerun the pair. No flow asserts a tick crossing devices, or an untick on a device; both could go in with this task.
<!-- SECTION:NOTES:END -->
