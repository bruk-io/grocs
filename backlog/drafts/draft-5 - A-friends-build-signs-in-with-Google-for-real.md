---
id: DRAFT-5
title: A friend's build signs in with Google for real
status: Draft
assignee: []
created_date: '2026-10-19 14:28'
labels:
  - ci
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Follow-up to TASK-10, carried forward from its open question. Needs from Bruk's local session: the Firebase project's google-services.json (as a CI secret, never committed), and the release signing key's SHA-1 registered in Firebase so Google Sign-In accepts the build.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A CI-built APK signs in with Google against the Firebase project, with the config supplied as a secret and nothing committed
<!-- AC:END -->
