---
id: TASK-1.28.1
title: 'Port error records withhold SDK messages, so Copy diagnostics carries none'
status: In Progress
assignee:
  - '@builder-application-small'
created_date: '2026-10-20 20:31'
updated_date: '2026-10-20 20:31'
labels:
  - size-1
  - layer-application
dependencies: []
parent_task_id: TASK-1.28
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found reviewing TASK-1.28. packages/application/src/instrumentation/instrument.ts describeError copies error.message (cut to 200 characters), and String(error) for non-Error values, into every failed port call's record, and those records sit in the release BufferLogger that Copy diagnostics copies. redact() matches keys and shapes, not free text, so an SDK or Firebase message quoting document data (an item name, an email) reaches the clipboard. decision-8: keep name and code, keep message only for GrocsError, withhold the rest. GrocsError does not exist yet, so every message is withheld until it does. The diagnostics copy is built from these records, so a test on the record covers it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 describeError keeps name and code and withholds every message, Error or not, until GrocsError exists, per decision-8
- [ ] #2 A test fails a port call with an Error whose message holds an item name and a person's name, and neither appears in the logged record
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. packages/application/src/instrumentation/instrument.ts, describeError: for an Error return { name: error.name, ...(code), message: '[sdk message withheld]' } (keep the code lines as they are); for a non-Error return { name: 'NonError', message: '[value withheld]' }. Add a one-line comment above the function: messages are withheld until GrocsError exists (decision-8), because SDK messages can quote document data and these records reach Copy diagnostics.
2. packages/application/src/instrumentation/instrument.test.ts: add a test 'withholds a failed call's message, so no data it quotes reaches the log', set up the way the file's existing tests set up a port and capture logger records: a port method that rejects with new Error('permission denied reading Zucchini for Sam'); after the call settles, expect JSON.stringify of the captured records not to contain 'Zucchini' and not to contain 'Sam', and the failed record's error.message to be '[sdk message withheld]'.
3. If an existing test in that file expects a copied message text, change only that expected value to '[sdk message withheld]' (or '[value withheld]') and say so in your report; delete no test.
4. Run pnpm test, pnpm check and pnpm typecheck. If a step does not fit the code, stop and report which.
<!-- SECTION:PLAN:END -->
