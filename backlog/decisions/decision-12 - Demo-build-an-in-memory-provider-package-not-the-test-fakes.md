---
id: decision-12
title: 'Demo build: an in-memory provider package, not the test fakes'
date: '2026-10-19 15:52'
status: accepted
---
## Context

TASK-10 needs a demo build friends can install and use with no account (TASK-10.3). It needs sign-in and sync that run on the phone with nothing leaving it. The in-memory fakes in `@grocs/ports/testing` (`FakeAuth`, `InMemorySyncStore`) already do that for tests. But the import-layers rule `testing-entry-test-only` (R49, R53) lets only tests import that entry, because the fakes must never ship. The demo is shipped code.

The TASK-10.3 builder stopped before editing and found two things:
- The rule blocks the demo from using the fakes. Putting the demo in a folder named `testing/` would pass the rule only as a naming loophole.
- `check:release` can't see the fakes at all. Its dev-only patterns match `testing/` folders and test files, not `fake.ts`, `test-support.ts` or `contract.ts`. A fake reaching a real release build would pass unnoticed.

The orchestrator offered Bruk two options:
- An exemption letting `apps/mobile/src/demo/` import the fakes, with a stricter release check in the same change.
- A real in-memory provider, so no rule bends.

## Decision

The demo runs on a real provider. A new package, `packages/providers-memory`, implements the auth and sync-store ports in memory, and it is held to the same port contract suites as the Firebase provider. It is a provider like any other, isolated from the other providers, and nothing in it is a test fake. Demo sign-in signs in a fixed demo member with no credentials. The test fakes stay test-only, and no exemption is added to `testing-entry-test-only`.

Decided by Bruk on Oct 19, 2026.

## Consequences

- The demo composition and the in-memory provider are shipped only in the demo variant. `check:release` must prove that the real release bundles hold neither, and it must also see the test fakes. That is TASK-10.6, a stricter check.
- Registering a fourth provider package touches the import-layers layer map, the providers agent config and doc-1's repository layout. The orchestrator does that before the provider is built.
- The in-memory sync store may share its approach with `InMemorySyncStore` but not its code: ports can't import providers, and the fake keeps its test-only methods. The contract suite is what proves the two behave the same.
- The real-sign-in build (DRAFT-5) is unaffected: it uses the Firebase provider.
