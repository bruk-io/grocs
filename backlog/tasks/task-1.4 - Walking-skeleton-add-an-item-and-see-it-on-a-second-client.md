---
id: TASK-1.4
title: 'Walking skeleton: add an item and see it on a second client'
status: To Do
assignee: []
created_date: '2026-10-18 17:38'
labels:
  - size-5
  - architecture
dependencies:
  - TASK-1.3
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The thinnest path through every layer, built in one session to discover the shapes of the ports, dispatcher and wiring before layer agents take over (decision on the agent workflow). Cites R15, R25, R28, R29, R30, R31, R32, R34, R36, R46, R47, R48, R49, R50, R53, R59, R63, R64, R65. Findings feed D4, D7, D8 and D9 and the layer agent configs; write them in the notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 core: adding an extra item to a week's list and normalising its name are pure functions with unit tests; one field-level last-write-wins merge has a property test (R25, R46)
- [ ] #2 ports: sync store, auth, clock, ids and logging each have an interface, an in-memory fake and a contract suite, and every fake passes its suite (R28, R29, R48)
- [ ] #3 application: an addItem command runs through one dispatcher whose logging middleware records type, duration, outcome and events with a correlation id; a scenario test runs it against the fakes (R32, R47)
- [ ] #4 providers: the Firestore sync store and the Auth provider pass the same contract suites against the emulators (R49); the stored item shape has a schema version and is validated on read and write (R30)
- [ ] #5 Every provider is wrapped once at the composition root by the instrumentation layer, and a test proves personal fields (item names) never reach a log record (R31, R34, R36)
- [ ] #6 Two clients against the emulators: an item added on one appears on the other within 3 seconds, shown by an automated test (R15)
- [ ] #7 ui: tokens come from one tokens.json (R59); one item-row molecule and the atoms it needs each have a story per state; the browser Storybook builds and component tests render the stories (R63 to R65)
- [ ] #8 app: an Expo app with one list screen and an add bar, wired at the composition root, signs in with a test sign-in against the Auth emulator in development builds only (R53); Android and iOS bundles build
- [ ] #9 Notes list what this workspace could not verify (device runs) and the findings for D4, D7, D8, D9 and the layer agent configs
<!-- AC:END -->
