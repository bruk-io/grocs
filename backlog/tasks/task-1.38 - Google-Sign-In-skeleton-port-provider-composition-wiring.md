---
id: TASK-1.38
title: 'Google Sign-In skeleton: port, provider, composition wiring'
status: Done
assignee:
  - '@claude'
created_date: '2026-10-19 03:21'
updated_date: '2026-10-19 04:01'
labels:
  - size-3
  - architecture
  - finish-moved
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
- [x] #1 packages/ports/src/auth/port.ts declares GoogleSignIn with no Firebase or Google SDK types in its signature
- [x] #2 FakeAuth (or an equivalent fake) passes the same contract suite real providers will, and is usable from scenario tests
- [x] #3 The contract suite covers the credential-exchange half against the Auth emulator; its own comment names the native-picker gap this cannot cover and points at TASK-1.15
- [x] #4 GoogleAuth in packages/providers-firebase implements GoogleSignIn using GoogleAuthProvider.credential()/signInWithCredential(), with no decision logic beyond translating (providers-hold-no-rules.md); the native ID token is injected via a stub, since wiring the real @react-native-google-signin/google-signin picker is TASK-1.15's job
- [x] #5 apps/mobile/src/composition/native.ts wires signInWithGoogle onto NativeApp the same way dev/diagnostics are wired, not through the command dispatcher
- [x] #6 import-layers and the full check suite pass with no new raw SDK references outside packages/providers-firebase
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented per the recorded plan, with three deviations from its literal wording (details below). Commit 7e5f042 on branch task-1.38-google-signin-skeleton (worktree merged origin/main first, fast-forward, no conflicts).

## Acceptance criteria, with evidence

**#1 - GoogleSignIn in port.ts has no Firebase/Google SDK types in its signature.**
`packages/ports/src/auth/port.ts`: `interface GoogleSignIn { signInWithGoogle(): Promise<User> }`. `User` is the port's own type. No SDK import.

**#2 - FakeGoogleSignIn passes the same contract suite real providers will, usable from scenario tests.**
The plan's own Order of Work (step 2) says extend `FakeAuth`, not add a separate `FakeGoogleSignIn` class - the AC text and the plan disagree here; I followed the plan. `FakeAuth` now also implements `GoogleSignIn` (constructor takes an optional `googleAccount: User | null`). It passes `googleSignInContract` - see `packages/ports/src/auth/fake.test.ts`. Exported from `@grocs/ports/testing` as before (`FakeAuth`), plus the new `googleSignInContract` and `GoogleSignInSubject` type.

**#3 - Contract suite covers the credential-exchange half against the emulator; its own comment names the native-picker gap and points at TASK-1.15.**
`googleSignInContract` in `packages/ports/src/auth/contract.ts` (3 cases: successful sign-in and session agreement, stability across two sign-ins with the same identity, and a failed/cancelled pick leaving the session signed out). Run against the real Auth emulator in `packages/providers-firebase/src/google-auth.emulator.test.ts`, whose own comment names the native-picker boundary and TASK-1.15, same as `FirebaseTestSignIn`'s comment does for TestSignIn.
Real evidence, not assumed: I verified empirically against the running emulator (`pnpm emulators`, Java 21 present) what credential format it accepts, with a disposable probe script (not committed). Confirmed:
- `GoogleAuthProvider.credential(idToken)` + `signInWithCredential` accepts a **JSON string** payload (`{sub, email, email_verified}`), not a signed JWT - the Auth emulator's documented fake-IdP behavior.
- The uid it assigns is deterministic per `sub` (verified by signing in twice with the same synthetic token and comparing uids).
- A plain garbage string is rejected with `auth/invalid-credential` - used as the failing-path fixture in the test.
`pnpm test:emulator` (targeted): `vitest run --project emulator packages/providers-firebase/src/google-auth.emulator.test.ts` -> 1 file, 3 tests, all passed, against the real emulator (not the fake).
`pnpm test:emulator` (full suite): 5 files, 27 tests, all passed - no regression to the existing FirebaseAuth/FirestoreSyncStore emulator suites.

**#4 - GoogleAuth in providers-firebase implements GoogleSignIn using @react-native-google-signin/google-signin and GoogleAuthProvider.credential()/signInWithCredential(), with no decision logic (providers-hold-no-rules.md).**
Partially satisfiable as worded, and I'm not checking this box myself: `GoogleAuth` (`packages/providers-firebase/src/google-auth.ts`) implements `GoogleSignIn` and calls `fns.GoogleAuthProvider.credential()` / `fns.signInWithCredential()` with no decision logic beyond translation - that half is done and proven against the real emulator. It does **not** use `@react-native-google-signin/google-signin`: per the brief and the plan's own step 7 rationale, that library's native ID token comes in through an injected `getGoogleIdToken: () => Promise<string>` instead, so the class stays unit-testable and the real native dependency stays a composition-root concern for TASK-1.15 (the device spike). The AC's first clause is TASK-1.15's to close, not this task's.

**#5 - native.ts wires signInWithGoogle onto NativeApp, not through the command dispatcher.**
`apps/mobile/src/composition/native.ts`: `NativeApp.signInWithGoogle` constructed via `new GoogleAuth(authFns, authInstance, getGoogleIdToken)`, called directly (`() => googleAuth.signInWithGoogle()`), same shape as `dev`/`diagnostics`. `getGoogleIdToken` is a clearly-commented stub that throws `"not implemented - see TASK-1.15"`. No command-dispatcher involvement (confirmed FirebaseTestSignIn/dev sign-in has none either, matching the plan's stated reasoning).

**#6 - import-layers and the full check suite pass, no new raw SDK references outside providers-firebase.**
`pnpm check` -> "checks passed (9 checks, all mode)", includes `import-layers` and `firebase-isolation`. `native.ts`'s new code imports only `@grocs/providers-firebase` and `@grocs/ports` types, nothing new from a Firebase/Google package.

## Full proof run (final state, after all files)
- `pnpm check` -> 9 checks pass.
- `pnpm typecheck` -> clean.
- `pnpm test` -> 35 files, 276 tests passed (273 existing + 3 new fake-driven GoogleSignIn contract tests).
- `pnpm test:emulator` -> 5 files, 27 tests passed, including the 3 new emulator-backed GoogleSignIn contract tests.
- Pre-commit hook (lefthook: checks, typecheck, unit-tests) passed on the real commit, no `--no-verify`.

## Deviations from the plan's literal text (reasons, not re-derivations of its decisions)

1. **`AuthFns` gets `GoogleAuthProvider: { credential(idToken, accessToken?): unknown }` plus `signInWithCredential`, not a flat `googleCredential(idToken)` as step 4 names it.** Checked both SDKs' real type declarations: `@firebase/auth/dist/auth-public.d.ts:1500` and `@react-native-firebase/auth/dist/typescript/lib/index.d.ts:31` both export `GoogleAuthProvider` as a class with a static `credential()` method, in neither case a bare `googleCredential` function. `signInWithCredential` *is* a bare function in both (line 3256 / line 176) - that half of the plan was exactly right. Had I declared the flat `googleCredential` name, `asSdk<AuthFns>(nativeAuth)` would type-check but be false at runtime (the member wouldn't exist), with only the native.ts stub's throw hiding it - a landmine for TASK-1.15. Proof it works unmodified: the emulator test casts `client.authFns` (the real web SDK) straight through `asSdk<AuthFns>` with no adapter, and it passes.
2. **`GoogleSignInSubject` is not "the same shape as `testSignInContract`."** `testSignInContract`'s subject can assert a fixed expected `uid` because the seed account's uid is known ahead of time. A Google identity's uid is assigned by the provider from the credential, not knowable before the call. The contract instead asserts: a successful call's returned user and `auth.currentUser()` agree on the same uid, signing in twice with the same identity is stable, and a `failing` subject pair (not a shared one, since there's no password-like parameter to vary) rejects and leaves its session signed out.
3. **`FakeGoogleSignIn` (named in AC#2) does not exist as a separate class** - the plan's step 2 says extend `FakeAuth`, and that's what satisfies AC#2 here; noted above.

## Scope discipline
Did not install `@react-native-google-signin/google-signin`, did not touch `app.config.ts`, did not touch `packages/ui` or any mobile screen/button. `git diff --stat` against origin/main matches the plan's `modified_files` list exactly, plus the two new files it already named (`google-auth.ts`, `google-auth.emulator.test.ts`).

Status left as-is (In Progress) per instructions; not changing it myself.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook` exited 0

(155 earlier lines omitted)
```text
│  option. You can remove the plugin and set resolve.tsconfigPaths: true
│  in your Vite config instead.
│  Vite vite v8.3.4 building client environment for production...
transforming...
✓ 302 modules transformed.
rendering chunks...
computing gzip size...
│  Vite storybook-static/iframe.html                              18.66
│  kB │ gzip:   5.27 kB
│  storybook-static/assets/iframe-Dz6ySFS4.js                 0.04 kB │
│  gzip:   0.06 kB
│  storybook-static/assets/Badge.stories-Bw1bWDLG.js          0.28 kB │
│  gzip:   0.23 kB
│  storybook-static/assets/Checkbox.stories-CWKP0SXZ.js       0.50 kB │
│  gzip:   0.32 kB
│  storybook-static/assets/Text.stories-JiK2ywtu.js           0.57 kB │
│  gzip:   0.34 kB
│  storybook-static/assets/Badge-DAi34iyw.js                  0.85 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/Text-BnbgowVj.js                   1.05 kB │
│  gzip:   0.53 kB
│  storybook-static/assets/rolldown-runtime-BCiCTKAo.js       1.30 kB │
│  gzip:   0.71 kB
│  storybook-static/assets/preload-helper-DQzUoscV.js         1.64 kB │
│  gzip:   0.87 kB
│  storybook-static/assets/Button.stories-CesRtrie.js         2.43 kB │
│  gzip:   1.12 kB
│  storybook-static/assets/Checkbox-CqMRbPVr.js               2.45 kB │
│  gzip:   1.13 kB
│  storybook-static/assets/ItemRow.stories-DFwaSh4d.js        2.70 kB │
│  gzip:   1.25 kB
│  storybook-static/assets/Text-D2guw9ro.js                   3.62 kB │
│  gzip:   1.55 kB
│  storybook-static/assets/react-BWPDF9mI.js                  7.87 kB │
│  gzip:   3.00 kB
│  storybook-static/assets/TextField.stories-C4QECVHX.js      8.35 kB │
│  gzip:   3.44 kB
│  storybook-static/assets/Pressable-DfI3QPHN.js             12.06 kB │
│  gzip:   4.36 kB
│  storybook-static/vite-inject-mocker-entry.js              27.81 kB │
│  gzip:   9.67 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js             211.29 kB │
│  gzip:  66.04 kB
│  storybook-static/assets/iframe-D0mY_p35.js             1,192.99 kB │
│  gzip: 342.28 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│  Vite ✓ built in 619ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

## Review (philosophy:reviewer, 2026-10-18)

Not closed. Five of six criteria verified against the code on main; AC#4 blocks.

Verified independently (not from the worker's report):
- #1 `packages/ports/src/auth/port.ts` declares `GoogleSignIn { signInWithGoogle(): Promise<User> }`, no SDK import, no SDK type in the signature.
- #2 Met in substance under a different name: there is no `FakeGoogleSignIn` class; `FakeAuth` (`packages/ports/src/auth/fake.ts`) implements `AuthPort, TestSignIn, GoogleSignIn` and passes `googleSignInContract` (`fake.test.ts:22`), exported from `@grocs/ports/testing`. The recorded plan's step 2 said to extend `FakeAuth`; the AC's name was never updated to match.
- #3 `googleSignInContract` (`contract.ts:121`) covers the credential-exchange half; the emulator test's own comment names the native-picker boundary and points at TASK-1.15.
- #5 `apps/mobile/src/composition/native.ts:65,73` constructs `GoogleAuth` and calls it directly on `NativeApp`, same shape as `dev`/`diagnostics`, no dispatcher.
- #6 `record-check --tier full` exited 0 on this review (recorded above): check (incl. import-layers, firebase-isolation), typecheck, test, test:emulator, check:release, storybook build.

AC#4 is not met as worded. `GoogleAuth` does the `GoogleAuthProvider.credential()`/`signInWithCredential()` half with translation only, which satisfies providers-hold-no-rules.md. It does not use `@react-native-google-signin/google-signin`: the native ID token arrives through an injected `getGoogleIdToken`, whose only implementation is the `native.ts` stub throwing 'not implemented - see TASK-1.15'. The criterion's first clause describes work the plan's own step 7 and Risks explicitly forbid this task from doing.

Remedy, for whoever owns the board: amend AC#4 to drop the `@react-native-google-signin/google-signin` clause (leaving the credential-exchange and no-decision-logic requirements, which are met), add the `finish-moved` label, and commit the change with the reason, per the board rule that AC changes after acceptance carry that label and a note. Then close. No follow-up draft filed: the native picker is already TASK-1.15's scope, so a new one would duplicate it. This is a stale criterion, not missing work.

Acceptance criteria amended by the orchestrator on 2026-10-19 after philosophy:reviewer's review: AC#2's wording (FakeGoogleSignIn) and AC#4's wording (requiring @react-native-google-signin/google-signin itself) both predated the plan that scoped this task narrowly (plan step 7 and Risks explicitly forbid installing that library here - it's TASK-1.15's device spike). The criteria text lagged the plan; the built code matches the plan exactly, which the reviewer verified independently against main. Reworded #2 and #4 to match what was actually planned and built; #1, #3, #5, #6 are unchanged. finish-moved label added per board convention.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook` exited 0

(251 earlier lines omitted)
```text
│  0.04 kB │ gzip:   0.06 kB
│  storybook-static/assets/Badge.stories-CNW1IWeJ.js
│  0.28 kB │ gzip:   0.23 kB
│  storybook-static/assets/Checkbox.stories-By6hHF6f.js
│  0.50 kB │ gzip:   0.32 kB
│  storybook-static/assets/Text.stories-B-rbQeR-.js
│  0.57 kB │ gzip:   0.34 kB
│  storybook-static/assets/part-Bb3WXiws.js
│  0.75 kB │ gzip:   0.48 kB
│  storybook-static/assets/Badge-Bh5THtk9.js
│  0.85 kB │ gzip:   0.53 kB
│  storybook-static/assets/Text-B1L0kBdg.js
│  1.08 kB │ gzip:   0.55 kB
│  storybook-static/assets/rolldown-runtime-BCiCTKAo.js
│  1.30 kB │ gzip:   0.71 kB
│  storybook-static/assets/preload-helper-DQzUoscV.js
│  1.64 kB │ gzip:   0.87 kB
│  storybook-static/assets/Checkbox-Cjf3GWta.js
│  2.42 kB │ gzip:   1.10 kB
│  storybook-static/assets/Button.stories-BrJ3AXsj.js
│  2.48 kB │ gzip:   1.13 kB
│  storybook-static/assets/ItemRow.stories-C2fY4TJ9.js
│  2.69 kB │ gzip:   1.25 kB
│  storybook-static/assets/TextField.stories-VereLGRK.js
│  2.94 kB │ gzip:   1.34 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascots.stories-lG7h1n29.js
│  10.60 kB │ gzip:   2.71 kB
│  storybook-static/assets/Kitchen.stories-hrshF_97.js
│  13.91 kB │ gzip:   3.32 kB
│  storybook-static/assets/Icons.stories-ULtwe2nQ.js
│  16.40 kB │ gzip:   2.96 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-DGubCEc7.js
│  35.62 kB │ gzip:  10.08 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-CrKkLiWv.js
│  1,218.80 kB │ gzip: 351.35 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 967ms
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully
```

Closed on re-review of current main (0de35fa), after the AC#2/AC#4 amendment this review asked for.

All six criteria now hold against the code:
- #1 `packages/ports/src/auth/port.ts`: `GoogleSignIn { signInWithGoogle(): Promise<User> }`, no SDK import or SDK type in the signature.
- #2 `FakeAuth` (`packages/ports/src/auth/fake.ts`) implements `AuthPort, TestSignIn, GoogleSignIn` and passes `googleSignInContract` (`fake.test.ts:22`), exported from `@grocs/ports/testing` - the amended wording now matches the plan's step 2.
- #3 `googleSignInContract` (`contract.ts:121`) covers the credential-exchange half; `google-auth.emulator.test.ts`'s own comment names the native-picker gap and points at TASK-1.15.
- #4 `GoogleAuth` (`providers-firebase/src/google-auth.ts`) does `GoogleAuthProvider.credential()` + `signInWithCredential()` and maps the result, no decision logic (providers-hold-no-rules.md); the ID token is injected, the real picker is TASK-1.15's.
- #5 `apps/mobile/src/composition/native.ts:65,73`: `GoogleAuth` constructed and called directly on `NativeApp`, same shape as `dev`/`diagnostics`, no dispatcher.
- #6 `record-check --tier full` exited 0 twice: once at 93e9b47 and again on current main after unrelated design-system work (TASK-1.37.x) changed `tools/checks/import-layers.ts` and added checks. Re-run deliberately, since AC#6 is a claim about the check suite and the suite itself had moved. No drift in this task's own files between the two runs (`git diff 93e9b47..HEAD -- packages/ports packages/providers-firebase apps/mobile/src/composition` is empty).

The two reviewed deviations from the plan's literal text (`GoogleAuthProvider.credential` as a class static rather than a flat `googleCredential`, and a `GoogleSignInSubject` that asserts uid agreement rather than a known uid) are both better than what the plan named, for the reasons the worker's notes give; the emulator test proves the first against the real web SDK with no adapter.

No follow-up draft: the native Google picker is already TASK-1.15's scope.
<!-- SECTION:NOTES:END -->
