---
id: TASK-10.5
title: Storybook published to GitHub Pages for friends without Android
status: In Progress
assignee:
  - '@builder'
created_date: '2026-10-19 14:28'
updated_date: '2026-10-19 14:28'
labels:
  - size-2
  - ci
dependencies: []
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For TASK-10: iPhone friends open every screen and component in a browser. A workflow builds Storybook and deploys it to GitHub Pages on each push to main. Pages on this plan needs the repo public, so the site goes live when Bruk flips the visibility; until then the workflow must not fail CI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A workflow builds Storybook and deploys it to GitHub Pages on push to main, and does nothing harmful while the repo is private
- [ ] #2 The README and the workflow say the Pages URL and that it goes live when the repo is public
<!-- AC:END -->
