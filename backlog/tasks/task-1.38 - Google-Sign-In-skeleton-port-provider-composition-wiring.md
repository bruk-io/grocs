---
id: TASK-1.38
title: 'Google Sign-In skeleton: port, provider, composition wiring'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 03:21'
updated_date: '2026-10-19 03:25'
labels:
  - size-3
  - architecture
dependencies:
  - TASK-1.4
modified_files:
  - packages/ports/src/auth/port.ts
  - packages/ports/src/auth/fake.ts
  - packages/ports/src/auth/fake.test.ts
  - packages/ports/src/auth/contract.ts
  - packages/ports/src/index.ts
  - packages/ports/src/test-support.ts
  - packages/providers-firebase/src/sdk.ts
  - packages/providers-firebase/src/google-auth.ts
  - packages/providers-firebase/src/google-auth.emulator.test.ts
  - packages/providers-firebase/src/index.ts
  - apps/mobile/src/composition/native.ts
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Architectural skeleton for R1 Google sign-in, discussed and agreed with Bruk. Scope is deliberately narrow: the ports/providers/composition-root plumbing only - no UI button (a separate session owns buttons/screens) and no native-library device wiring that needs TASK-1.15's spike to confirm feasibility first. This makes the real implementation a small, well-tested drop-in once TASK-1.15 confirms the approach, rather than a cold start.

Shape, from doc-1's R26 layer table:
- packages/ports/src/auth/port.ts: a new GoogleSignIn interface, separate from AuthPort, mirroring why TestSignIn is already split out (its own native dependency, not every provider needs it). Method named by intent per ports-describe-intent.md: signInWithGoogle(): Promise<User>, no SDK vocabulary or types leaking through.
- packages/ports/src/auth/fake.ts: FakeGoogleSignIn, deterministic, for scenario tests.
- packages/ports/src/auth/contract.ts: a contract suite covering what's actually testable without a device - the credential-exchange half (signInWithCredential against the Auth emulator, given a pre-made token), not the native Google picker itself (same emulator boundary FirebaseTestSignIn's own comment already names: Google's native sign-in screen cannot reach the emulator).
- packages/providers-firebase: a GoogleAuth class implementing GoogleSignIn, using @react-native-google-signin/google-signin (not yet installed) to get the native ID token, then GoogleAuthProvider.credential() + signInWithCredential() to exchange it - the standard RNFirebase pattern.
- apps/mobile/src/composition/native.ts: one more field on NativeApp (signInWithGoogle), wired the same way dev/diagnostics already are - NOT routed through packages/application's command dispatcher, since sign-in produces no domain event (confirmed: the existing dev sign-in has zero presence in packages/application, called directly from native.ts, observed via onAuthStateChanged).
- packages/core: only if a pure error-code mapping function turns out to be worth it (Google/Firebase error codes -> a closed set the UI can branch on) - judge this while implementing, don't force it if there's nothing to decide.

Out of scope, deliberately: the actual 'Sign in with Google' button and its branding (R1's Google button rules) - a separate session owns UI. Full native-picker verification on a real device/simulator - that's TASK-1.15, still to do.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 packages/ports/src/auth/port.ts declares GoogleSignIn with no Firebase or Google SDK types in its signature
- [ ] #2 FakeGoogleSignIn passes the same contract suite real providers will, and is usable from scenario tests
- [ ] #3 The contract suite covers the credential-exchange half against the Auth emulator; its own comment names the native-picker gap this cannot cover and points at TASK-1.15
- [ ] #4 GoogleAuth in packages/providers-firebase implements GoogleSignIn using @react-native-google-signin/google-signin and GoogleAuthProvider.credential()/signInWithCredential(), with no decision logic beyond translating (providers-hold-no-rules.md)
- [ ] #5 apps/mobile/src/composition/native.ts wires signInWithGoogle onto NativeApp the same way dev/diagnostics are wired, not through the command dispatcher
- [ ] #6 import-layers and the full check suite pass with no new raw SDK references outside packages/providers-firebase
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work

1. Port: add `GoogleSignIn { signInWithGoogle(): Promise<User> }` to packages/ports/src/auth/port.ts, beside AuthPort/TestSignIn. Export it from packages/ports/src/index.ts.
2. Fake: extend FakeAuth to also implement GoogleSignIn (constructor takes an optional googleAccount). Extend fake.test.ts.
3. Contract: add googleSignInContract to contract.ts, same shape as testSignInContract (signs in successfully; a failed/cancelled pick leaves the session signed out). Export both it and the GoogleSignInSubject type from test-support.ts.
4. Provider plumbing (sdk.ts): extend AuthFns with signInWithCredential(auth, credential) and googleCredential(idToken): unknown - both exist with the same call shape in the web and native Firebase SDKs, so this follows the file's own established "modular API slice" pattern. No call-site changes needed elsewhere (asSdk<AuthFns>(nativeAuth) is a type cast, not a literal construction).
5. Provider: new packages/providers-firebase/src/google-auth.ts. GoogleAuth implements GoogleSignIn, constructor (fns: AuthFns, auth: unknown, getGoogleIdToken: () => Promise<string>). signInWithGoogle() calls getGoogleIdToken(), builds the credential via fns.googleCredential, exchanges it via fns.signInWithCredential, maps the result to User. getGoogleIdToken is injected (not a hard import of @react-native-google-signin/google-signin) so the class is fully unit-testable and the real native call stays a composition-root concern, same reasoning as why Constants/Platform are imported in native.ts and not inside a provider. Export GoogleAuth from providers-firebase's index.ts.
6. Emulator contract test: packages/providers-firebase/src/google-auth.emulator.test.ts, same shape as firebase-auth.emulator.test.ts, running googleSignInContract against the real Auth emulator via the web SDK, with getGoogleIdToken supplying a synthetic token. RISK: whether the Auth emulator accepts a synthetic Google credential without real OAuth verification is unconfirmed - verify empirically against the running emulator before assuming a token format works.
7. Composition root: add signInWithGoogle to NativeApp in native.ts, constructed via GoogleAuth, wired the same way dev/diagnostics already are (not through the command dispatcher - confirmed FirebaseTestSignIn has no presence in packages/application). getGoogleIdToken stays a clearly-marked stub that throws "not implemented - see TASK-1.15" rather than installing @react-native-google-signin/google-signin now: that library's actual integration, its Expo config plugin, and any native build issues are TASK-1.15's job to find, not this task's to get ahead of. This task proves the abstraction is coherent and testable; TASK-1.15 proves the real device path.

### Risks

- Emulator credential format for step 6 is unverified - if the emulator can't be made to accept a synthetic credential within reasonable effort, fall back to testing only the rejection path (an invalid credential correctly fails, session stays signed out) and say so plainly in the test file's own comment, same honesty precedent as "FCM has no emulator" in decision-4.
- Extending the shared AuthFns interface touches a file FirebaseAuth and FirestoreSyncStore's test harness also use - must not change either's existing behavior; new members only, nothing removed or renamed.
- Scope discipline: do not install @react-native-google-signin/google-signin, do not touch app.config.ts, do not touch anything under packages/ui or apps/mobile screens/buttons - those are explicitly out of scope (the other session, and TASK-1.15).

### Proof

- pnpm check, pnpm typecheck, pnpm test (the new fake-driven contract test must pass, matching the existing 273)
- pnpm test:emulator for the new google-auth.emulator.test.ts specifically - real evidence of what the emulator actually does with a synthetic credential, not an assumption
- import-layers passes with no new raw SDK references outside packages/providers-firebase (the composition-root stub in native.ts imports nothing new)
<!-- SECTION:PLAN:END -->
