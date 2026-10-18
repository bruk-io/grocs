---
id: TASK-1.35
title: Update CI actions off deprecated versions
status: To Do
assignee: []
created_date: '2026-10-18 18:45'
updated_date: '2026-10-18 19:16'
labels:
  - size-1
  - delivery
milestone: m-1
dependencies: []
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub's first runs warn that checkout, setup-node, setup-java, cache and pnpm action-setup v4 target the deprecated Node.js 20 runtime, setup-java v4 gets no more updates, and ubuntu-latest moves to Ubuntu 26 from Oct 19, 2026.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CI runs with no deprecation annotations
- [ ] #2 All three CI jobs still pass
<!-- AC:END -->
