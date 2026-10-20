---
id: DRAFT-14
title: Confirm the global error and rejection handlers on the phones
status: Draft
assignee:
  - bruk
created_date: '2026-10-20 20:21'
labels:
  - size-1
  - layer-app
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Moved from TASK-1.28 criterion 3 review: decision-8 says the Hermes rejection tracker (HermesInternal, not a public API) must be confirmed on both phones in a development build; vitest can only drive it through fakes. Also: React Native's polyfillPromise.js installs its own Hermes tracker in __DEV__ (the LogBox 'possible unhandled promise rejection' warning), and Hermes allows one tracker, so observe.ts replaces it in development builds - decision-8's 'nothing else installs one' holds only in release. Needs dev builds on the Fold and an iPhone.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On a development build on iOS and on Android, a thrown error inside a promise and an uncaught error each produce one record with source rejection/global, with screenshots or log lines in the notes
- [ ] #2 In development the unhandled-rejection warning still shows (observe.ts also calls React Native's promiseRejectionTrackingOptions onUnhandled), or the loss is accepted in decision-8
<!-- AC:END -->
