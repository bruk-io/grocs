---
id: TASK-74.4.8
title: 'Manual local proof: the import function imports real recipes in the emulator'
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 02:28'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.4.7
  - TASK-74.4.2
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-74.4 AC#7 and TASK-74 AC#13. A live fetch is allowed only in this manual run (decision-15). This is also the only run of the default node:http/https transport and the guarded lookup against real DNS. No deploy commands are used.

Split key: orch-proof-function. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implementation notes on TASK-74.4 record: pnpm emulators running; real URLs from three fixture sites (one of them NYT Cooking) imported through the callable, with titles and counts; a second call answered from the cache with no new fetch; a URL whose host resolves to 127.0.0.1 (http://localhost.:8080/x) refused as unreachable; and a log excerpt showing no URL or title
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `pnpm emulators` from the repo root in the background, and wait for ports 8080, 9099 and 5001.
2. Write a scratchpad script that signs in anonymously with firebase/emulator-client.ts createEmulatorClient and calls httpsCallable(functions, 'importRecipe') with each of three source URLs from the fixtures README, one of them NYT Cooking.
3. Record each result's ok, title, ingredient count and step count.
4. Call the first URL again and confirm from the functions emulator log that no fetch happened (a cache hit).
5. Call it with 'http://localhost.:8080/x' and confirm the result is {ok:false,error:'unreachable'}.
6. Grep the emulator log for the URLs and recipe titles and confirm there are no matches (R36).
7. Write the results into the TASK-74.4 notes with the backlog CLI, then stop the emulators.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->
