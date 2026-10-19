---
id: DRAFT-1
title: Pin the CI runner image so a GitHub image move can't fail every browser pass
status: Draft
assignee: []
created_date: '2026-10-19 12:40'
labels:
  - testing
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the TASK-1.40/1.41 review. ci.yml and visual-baselines.yml run on ubuntu-latest, and GitHub's annotation on run 39244676209 says that label moves to Ubuntu 26 from Oct 19, 2026. Both jobs move together, so the workflow stays the reference, but after the move the browser pass can fail on every pull request (font rendering) until someone regenerates the baselines.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every job in ci.yml and visual-baselines.yml runs on one pinned Ubuntu image, named in one place
- [ ] #2 The repo says how to move to a new image: bump the pin and regenerate the baselines through the visual baselines workflow in the same change
<!-- AC:END -->
