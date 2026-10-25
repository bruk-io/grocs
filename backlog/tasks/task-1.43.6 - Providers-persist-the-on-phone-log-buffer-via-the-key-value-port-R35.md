---
id: TASK-1.43.6
title: 'Providers: persist the on-phone log buffer via the key-value port (R35)'
status: To Do
assignee: []
created_date: '2026-10-25 17:23'
updated_date: '2026-10-25 17:24'
labels:
  - layer-providers
  - size-2
dependencies:
  - TASK-1.43.1
references:
  - >-
    backlog/decisions/decision-8 -
    Logging-keep-the-skeletons-wiring-and-close-its-gaps.md
parent_task_id: TASK-1.43
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
BufferLogger is an in-memory ring only, so R35's 'release builds keep the most recent log records... which a member can copy' doesn't survive the crash it exists to explain - it's gone with the process. decision-8's design: write the rings to the key-value port (prerequisite tasks) under key grocs.log.buffer, capped at 256 KB of JSON lines with the oldest dropped first, after any error record and when the app goes to the background; read the stored rings back at start, before the first new record.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 BufferLogger writes its rings to the key-value store after an error record and on AppState going to background, capped at 256 KB with oldest records dropped first
- [ ] #2 apps/mobile/src/composition/native.ts reads the stored rings back at start, before the first new record is logged
<!-- AC:END -->
