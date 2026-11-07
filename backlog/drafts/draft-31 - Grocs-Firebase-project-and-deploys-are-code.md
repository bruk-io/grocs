---
id: DRAFT-31
title: Grocs' Firebase project and deploys are code
status: Draft
assignee:
  - '@bruk'
created_date: '2026-11-07 00:58'
updated_date: '2026-11-07 01:01'
labels: []
dependencies: []
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Grocs runs on a real Firebase project (io-bruk-grocs-dev), but everything about that project was set up by hand and lives nowhere in the repo. Getting kitchen sharing working end to end on Oct 24, 2026 meant enabling the Cloud Functions API by hand, adding the Cloud Run invoker IAM binding by hand, and deploying functions through an uncommitted esbuild workaround (TASK-48; details in TASK-1.20's notes). Nobody, including Bruk next time, can repeat that without re-deriving it, and nothing deploys from CI. Every server-side feature now waits on this: kitchen sharing and invites today, push notifications (R24), and recipe import from a link, which adds a new Cloud Function and a Firestore cache.

## Affected users and systems
- Bruk, who deploys by hand today.
- The live Firebase project io-bruk-grocs-dev: enabled APIs, IAM bindings (including the Cloud Run invoker), the Firestore database, the billing plan, Auth providers.
- apps/functions and firebase.json (functions, Firestore rules and indexes), and CI (.github/workflows).
- TASK-48 (functions deploy can't resolve pnpm workspace dependencies) is part of this work.
- TASK-10's carried-forward question about the Firebase config a real-sign-in build needs (google-services.json, the signing key's SHA-1) touches the same project.

## Open questions
- [ ] Which tool holds the project's infrastructure: Terraform with the Google provider, or something else.
- [ ] Where infrastructure state lives (for Terraform, a state bucket) and how it is bootstrapped.
- [ ] How the hand-made state in io-bruk-grocs-dev is brought under code: import it as is, or recreate the project.
- [ ] One project, or separate dev and production projects.
- [ ] How CI authenticates to Google Cloud to deploy (workload identity federation or a service account key).
- [ ] Whether Auth providers (Google sign-in) and the app registrations are managed as code too, or stay manual.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The project's enabled APIs, IAM bindings (including the Cloud Run invoker), Firestore database and billing budget alert are defined in the repo and applied from it, with no console steps
- [ ] #2 Applying the infrastructure to the live project when nothing has changed makes no changes
- [ ] #3 Functions, Firestore rules and Firestore indexes deploy from CI on merge to main, with no manual steps
- [ ] #4 A functions deploy succeeds from a clean checkout (TASK-48's criteria)
- [ ] #5 A budget alert notifies Bruk before monthly spend passes an agreed amount
- [ ] #6 No credentials or keys are committed to the repo
- [ ] #7 Must not break: pnpm emulators and pnpm test:emulator keep running against the demo project, and no test or CI check other than the deploy job touches the live project
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Order (Bruk, 2026-11-06): the recipe import (TASK-74) is proven locally in the Functions emulator first; this deployment work follows once the parsing and client code work.
<!-- SECTION:NOTES:END -->
