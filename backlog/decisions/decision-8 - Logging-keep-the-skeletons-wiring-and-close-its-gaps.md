---
id: decision-8
title: 'Logging: keep the skeleton''s wiring and close its gaps'
date: '2026-10-18 19:01'
status: accepted
---
## Context

Design question D7 in doc-1 (TASK-1.12): how logging is wired. It covers the port wrapper, command middleware, correlation context, redaction marking and the on-phone buffer.

Requirements served:
- R31: every provider is instrumented once, at the composition root.
- R32: the dispatcher middleware logs type, duration, outcome and event types, with a correlation id, app version, platform and kitchen role.
- R33: global error, render-error and screen-change handlers.
- R34: one record shape that fits OpenTelemetry.
- R35: console in development, a bounded on-phone buffer in release with a copy action.
- R36: personal fields stripped, enforced by the logging contract.
- R37: only the console provider touches the console.

As built in the skeleton (TASK-1.4):
- `packages/ports/src/logging/port.ts`. The `LogRecord` shape is `{timestamp, severity, message, attributes, correlationId?}`. `Logger.log(record)` is the interface. `safeRecord()` runs core's `redact()` over the attributes.
- `packages/application/src/instrumentation/instrument.ts`. `instrumentPort` is a `Proxy` that logs `port, method, durationMs, outcome, error` and the runtime fields for every call. It never logs arguments or results. `instrumentDeps` wraps the four ports.
- `packages/application/src/dispatch/logging-middleware.ts`. Logs `commandType, durationMs, outcome (ok | rejected | error), eventTypes, errorCode`, never the payload.
- `apps/mobile/src/composition/compose-app.ts` builds a fresh `instrumentDeps` per command through `depsFor(correlation)`. Reads outside commands share one `session-<id>` correlation id for the app's life.
- `packages/core/src/schema/personal.ts`. `PERSONAL_FIELDS` marks `name` and `amount` on objects shaped like an item (`weekId` and `addedBy` present) and `name` and `link` on meals. `PERSONAL_ATTRIBUTE_KEYS` covers `itemName`, `mealLink` and similar keys. `redact()` is pure and cuts cycles.
- `providers-device`. `ConsoleLogger` is the only console user, and the `console-use` check enforces it. `BufferLogger` is an in-memory ring of 500 records with `dump()` as JSON lines. `native.ts` picks the console in development and the buffer in release.
- Evidence: the logger contract has a test that personal fields never get through. `two-client.emulator.test.ts` runs a real `AddItem` through the Firebase providers with a non-redacting logger and finds no item name in any record.

Gaps found reading the code:
- R33 is not built. Nothing installs a global error handler, a rejection tracker, a render boundary or screen logging.
- `watchItems` and `onAuthStateChanged` are instrumented only for the subscribe call. Errors delivered later to `onError` are never logged.
- `describeError` copies `error.message`, cut to 200 characters, into the record. `redact()` matches keys and shapes, not free text, so a message that quotes document data would get through. Our own messages carry ids only, but SDK messages are not ours.
- Personal marking is matched by shape. The change documents in D4 (`payload.name`, `subject`) don't have the item shape, so they would not be redacted.
- The release buffer lives in memory only, so it is gone after the crash it was meant to explain. Every port call logs at `debug`, so 500 records cover only a minute or two of use.
- `kitchenRole` is hard-coded to `"member"`.

Options weighed:
- Instrumentation by `Proxy` at the composition root (keep). It is one wrapper for every port with no code in providers (R31), and it can't leak arguments because it never reads them. The cost is that `Proxy` hides the call site, so a record names `syncStore.append` and not the screen that caused it. The correlation id covers that. The alternative, hand-written decorators per port, means more code per port and drift.
- Correlation passed explicitly in `CommandContext` (keep). Hermes has no `AsyncLocalStorage`, and zone-style context libraries patch promises, which costs more than it saves for one dispatcher. The cost is that anything outside a command needs its own id.
- Redaction by shape (skeleton) or by schema-declared paths. Shape matching catches objects nobody declared, but it misses new shapes silently. Paths declared beside each codec turn a new field into a decision, and a script can check that the decision was made.
- Release buffer in memory, or persisted. Persisting needs the key-value storage port (R28), which isn't built yet, but it is the only version that helps after a crash.
- Global errors through React Native's `ErrorUtils.setGlobalHandler`, Hermes' native rejection tracker, and Expo Router's `ErrorBoundary` exports. Or a crash SDK such as Sentry, which is out of scope: telemetry and hosted services are paused (doc-1).

## Decision

Keep the skeleton's shape (port, Proxy instrumentation, explicit correlation, logging middleware, console in development and a buffer in release) and close the gaps.

Record shape (R34). `LogRecord` stays as built. Its mapping to the OpenTelemetry log data model is written in `port.ts`:
- `timestamp` maps to `Timestamp`.
- `severity` maps to `SeverityText`, with `SeverityNumber` 5, 9, 13 and 17 for debug, info, warn and error.
- `message` maps to `Body`.
- `attributes` maps to `Attributes`.
- `correlationId` maps to the attribute `grocs.correlation_id`. It is not a `TraceId`, because there are no spans.

A hosted provider later maps exactly this.

Port wrapper (R31): `instrumentPort` as built, with three additions.
- Callbacks passed to `watch*` methods are wrapped as well. A call to `onError`, or a `watchRejections` delivery from D4, logs `{port, method, outcome: "error", error}` at `warn` with the subscription's correlation id.
- Each subscription gets its own correlation id, `watch-<id>`, logged once when it starts with `{port, method}`. The shared `session-` id stays for one-off reads such as `signOut`.
- `describeError` keeps `name` and `code`. It keeps `message` only for errors the repo defines, which are instances of a new `GrocsError` class in `packages/core/src/result/`. Their messages are written by us, with ids only. Other errors (SDK, platform) log `message: "[sdk message withheld]"`, and their `code` carries the meaning. Firebase codes such as `permission-denied` and `unavailable` are enough to act on.

Command middleware (R32): as built. `runtime.kitchenRole` comes from the session once kitchens exist (R2 and R3): `"creator"` or `"joiner"` from the kitchen document. Until then it is `"none"`, not a made-up `"member"`.

Correlation context: explicit, as built. Every record written by a command, its middleware or its instrumented ports carries `ctx.correlationId`. Nothing reads ambient state.

Redaction marking (R36):
- Each schema module in `packages/core/src/schema/` exports `PERSONAL: readonly string[]` and `NOT_PERSONAL: readonly string[]`. These are dotted paths over its encoded document; D4's `activity.ts` has `subject`, `payload.name`, `payload.amount`, `payload.link` and `payload.value` when `field` is `name`, `amount` or `link`.
- `personal.ts` builds `redact()` from the union of those lists, plus the existing attribute-key set (`itemName`, `mealLink` and so on), plus the existing item and meal shape rules as a fallback.
- New check `personal-marking` (D8, R36): every string-valued property of every exported `*Doc` interface in `packages/core/src/schema/` must appear in exactly one of that module's lists. The failure names the field and says "decide whether a member typed this".
- The logger contract gains a case built from D4's fixtures. Every fixture change logged as an attribute must come out with no personal value.

On-phone buffer (R35):
- `BufferLogger` keeps two rings: 400 records at `info` and above, and the latest 100 at `debug`. `dump()` merges them in time order.
- It takes a key-value storage port (R28, built when that port lands; the logger depends on the port, not on a provider). It writes the rings under key `grocs.log.buffer`, capped at 256 KB of JSON lines with the oldest dropped first, after any `error` record and when the app goes to the background (AppState `background`, wired in the composition root).
- At start it reads the stored rings back before the first new record. This happens in `apps/mobile/src/composition/native.ts`.
- The diagnostics action in settings copies `dump()` to the clipboard (`expo-clipboard`) with a header line giving the app version, platform and build number. It is reached from a settings row, never shown by default.

Global handlers (R33). They are installed once, in a new `apps/mobile/src/composition/observe.ts`, called from `createNativeApp()` before the first render:
- Uncaught JS errors: `ErrorUtils.setGlobalHandler((error, isFatal) => { log at error with {source: "global", isFatal}; previous(error, isFatal) })`. It keeps and calls the previous handler so React Native's red box in development and its crash behaviour in release don't change.
- Unhandled rejections: Hermes' native tracker (`HermesInternal.enablePromiseRejectionTracker({allRejections: true, onUnhandled})`). It is guarded by a check that `HermesInternal` exists, and logs at `error` with `{source: "rejection"}`. Only one tracker can be active on Hermes, which is fine because nothing else installs one.
- Render errors: `app/_layout.tsx` exports an `ErrorBoundary` that logs `{source: "render", route}` and shows a retry screen. Screens may export their own and still log through the same helper.
- Screen changes: the root layout logs `{source: "screen", route}` at `info` from a `useEffect` on `useSegments()`. It logs the route pattern (`/week/[weekId]`), never `usePathname()` or search params, so ids and any typed text never enter a record.
- All four go through a single `observe` logger with correlation id `app-<id>`, one per app start.

Console (R37): as built. The `console-use` check stays. `observe.ts` writes through the Logger, never the console.

## Consequences

- Personal data stays out of logs in three ways: the instrumentation never reads arguments, schema-declared paths are redacted, and SDK messages are withheld. The `personal-marking` check makes adding a stored field without deciding about it a failing build.
- Withholding SDK messages loses detail when something unusual breaks in Firebase. The error `code` and the port and method remain. If that proves too little, an allow-list of message patterns known to hold only ids can be added to `describeError`, with tests.
- Persisting the buffer adds a write on every `error` record and on every trip to the background. At 256 KB that is negligible, but it depends on the key-value port, which is the next port to build. Until then the buffer stays in memory and R35 is met only while the app runs.
- `observe.ts` depends on `HermesInternal`, which is not a public API. The rejection tracker has to be confirmed on both phones in a development build: throw inside a promise and see the record. The guard keeps the app working if the API is missing, but rejections then go unlogged.
- Per-subscription correlation ids make listener errors traceable, at one extra `debug` record per subscription.
- Ruled out: logging command payloads or port arguments under any flag, `console.*` outside `ConsoleLogger`, and third-party crash SDKs while telemetry is paused.
- Still open: the hosted log provider and its no-screen-capture configuration (doc-1's R34 against R36 concern), and whether the diagnostics copy also needs a share sheet.

## Sources

- OpenTelemetry, Logs data model (Timestamp, SeverityText and SeverityNumber, Body, Attributes): https://opentelemetry.io/docs/specs/otel/logs/data-model/index.md
- Expo Router, Error handling (route `ErrorBoundary` exports, nearest-parent fallback): https://docs.expo.dev/router/error-handling
- Expo Router, Screen tracking (root-layout effect on route changes): https://docs.expo.dev/router/reference/screen-tracking/
- Sentry, React Native unhandled rejections (Hermes' native rejection tracking, one tracker at a time): https://docs.sentry.io/platforms/react-native/integrations/unhandled-rejections
- Repository evidence: `packages/ports/src/logging/{port,contract}.ts`, `packages/application/src/instrumentation/instrument.ts`, `packages/application/src/dispatch/logging-middleware.ts`, `apps/mobile/src/composition/{compose-app,native}.ts`, `packages/core/src/schema/personal.ts`, `packages/providers-device/src/{buffer,console}-logger.ts`, `apps/mobile/src/composition/two-client.emulator.test.ts`; TASK-1.4 D7 findings
