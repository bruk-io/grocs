---
id: TASK-55
title: >-
  release.yml's iOS bundle check reads the newest build, not the one the job
  just built
status: To Do
assignee: []
created_date: '2026-11-06 18:52'
labels:
  - size-1
  - release
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Follow-up from TASK-53's review. The iOS job downloads the IPA to check via eas build:list --limit 1 and submits with --latest. That is the right build only because the release concurrency group stops two runs overlapping; a build started from elsewhere (eas build from a laptop) in that window would be checked and submitted instead. Building with --json and using its id for both the download and eas submit --id makes it exact. It changes the existing build and submit lines, which the weakening check (R57) blocks: it needs a sanctioned override in tools/checks/weakening-overrides.json, which only Bruk can add.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The iOS job checks and submits the build id its own build step returned
<!-- AC:END -->
