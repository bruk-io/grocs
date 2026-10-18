---
id: decision-1
title: 'Backend: Firebase for sync, sign-in and push'
date: '2026-10-18 17:19'
status: accepted
---
## Context

Design question D4 in the spec (doc-1) needs a store for the kitchen's data. R15 and R16 ask for live updates within 3 seconds and full offline use that survives restarts. R1 makes Google the only sign-in, and R24 needs a server-side function to send pushes. Bruk decided on Oct 18, 2026.

Options weighed:
- Firebase (Firestore, Firebase Auth, Cloud Functions): built-in offline cache and live listeners on the native SDKs, Google sign-in built in, and a local emulator suite for Firestore, Auth and Functions.
- Supabase (Postgres, realtime): no offline mode without an extra sync layer such as PowerSync, and the local stack runs in Docker.

## Decision

The backend is Firebase: Firestore for the kitchen's data, Firebase Auth for Google sign-in, and Cloud Functions for push. The apps use the native SDKs (`@react-native-firebase`), not the web SDK, because offline persistence on React Native depends on them. All of it sits behind the ports in R28, in one provider package.

## Consequences

- The apps run as Expo development builds, not Expo Go.
- Cloud Functions need Firebase's pay-as-you-go plan; at two members the cost is expected to be negligible.
- Local development and provider tests run against the Firebase emulator suite, which needs Java and no Docker.
- Google's native sign-in screen can't reach the Auth emulator, so development builds need a test sign-in behind the auth port, compiled out of release builds (R1).
- The rest of D4 (document shapes, field-level merges, tombstones, the activity outbox, schema versions) is still open and is designed for Firestore.
- Changing backends later means a new provider package that passes the same contract suites (R29), not changes to the domain or UI.
