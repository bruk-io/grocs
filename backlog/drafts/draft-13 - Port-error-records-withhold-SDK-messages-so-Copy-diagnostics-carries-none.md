---
id: DRAFT-13
title: 'Port error records withhold SDK messages, so Copy diagnostics carries none'
status: Draft
assignee: []
created_date: '2026-10-20 20:21'
labels:
  - size-1
  - layer-application
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-1.28. packages/application/src/instrumentation/instrument.ts describeError still copies error.message (cut to 200 characters) into every failed port call's record, and those records sit in the release BufferLogger that Copy diagnostics copies. redact() matches keys and shapes, not free text, so an SDK or Firebase message quoting document data (an item name, an email) reaches the clipboard. decision-8 closes this: keep name and code, keep message only for GrocsError, log '[sdk message withheld]' otherwise. TASK-1.28's copy test covers only a successful AddItem, so it never exercises this path.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 describeError keeps name and code and withholds the message of any error that is not a GrocsError (or withholds all messages until GrocsError exists), per decision-8
- [ ] #2 A test fails a port call with an Error whose message holds an item name, and the record (and the diagnostics copy) does not contain it
<!-- AC:END -->
