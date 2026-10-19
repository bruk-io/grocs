---
id: TASK-10.8
title: 'In-memory providers for sign-in and sync, so the demo runs without test fakes'
status: In Progress
assignee:
  - '@builder-providers'
created_date: '2026-10-19 15:52'
updated_date: '2026-10-19 16:01'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
builder-providers: stopped before editing, no package created. The auth port (packages/ports/src/auth/port.ts) has no method that fits a no-credential demo sign-in. AuthPort only reads the session and signs out. TestSignIn.signInWithTestAccount(email, password) needs credentials and is development-only (R53, kept out of release bundles). GoogleSignIn.signInWithGoogle() takes no arguments but is Google-specific, and its contract suite requires a failing pair (cancelled pick), which a demo has no meaning for. Options for Bruk/ports layer: (a) add a DemoSignIn port (signInAsDemoMember(): Promise<User>) with a contract suite, then providers-memory implements it; (b) accept a MemoryAuth-only method outside any port, which the UI could not call through a port. Ports not changed.
<!-- SECTION:NOTES:END -->
