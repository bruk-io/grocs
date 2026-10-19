---
id: TASK-10.8
title: 'In-memory providers for sign-in and sync, so the demo runs without test fakes'
status: In Progress
assignee:
  - '@builder-providers'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 15:56'
labels:
  - size-3
  - layer-providers
dependencies:
  - TASK-10.7
references:
  - >-
    backlog/decisions/decision-12 -
    Demo-build-an-in-memory-provider-package-not-the-test-fakes.md
parent_task_id: TASK-10
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-12: packages/providers-memory implements the auth and sync-store ports in memory for the demo build. It is a provider like any other, held to the same port contract suites as the Firebase provider, and nothing in it is a test fake. It shares an approach with the fakes in @grocs/ports/testing but not their code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/providers-memory implements the auth and sync-store ports and passes the same port contract suites the Firebase provider passes
- [ ] #2 Demo sign-in signs in a fixed demo member with no credentials, and nothing in the package touches the network or disk
- [ ] #3 It imports only core and ports through their package entries, never @grocs/ports/testing, and pnpm check passes with no exemption added
<!-- AC:END -->
