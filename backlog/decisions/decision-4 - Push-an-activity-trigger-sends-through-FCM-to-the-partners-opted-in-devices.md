---
id: decision-4
title: 'Push: an activity trigger sends through FCM to the partner''s opted-in devices'
date: '2026-10-18 18:36'
status: proposed
---
## Context

Design question D5 in doc-1: how push notifications reach a member when the other member adds something (R24). It must use the activity record written atomically with every change (R22), stay off by default with the OS prompt shown only when a member turns pushes on (R24), keep the layering (R26, R28: the function in `apps/functions` is a composition root over core, ports, application and `providers-server`), run its tests in the emulators without Docker or production data (R52), and use the Firebase stack chosen in decision-1. The phones are a Pixel 10 Fold (Android 16) and a recent iPhone. Current versions: Expo SDK 58 (React Native 0.88, New Architecture only since SDK 55), `@react-native-firebase/messaging` 26.4.0 (New Architecture required since 26.0.0), `firebase-functions` 7.4.0, `firebase-admin` 14.5.0, `firebase-tools` 15.34.0, Cloud Functions Node.js 24 runtime.

What triggers the send:
- Firestore `onDocumentCreated` on the activity record. One function and one place to filter, and the activity already says who did what. It fires when the change reaches the server, so offline additions (R16) still notify once they sync. Delivery is at least once, so a send can repeat.
- Triggers on the item and meal documents. Two functions with the same filter, and they would have to work out "who" and "added" from document diffs that the activity record already states.
- A callable function invoked by the app after an addition. Fails offline (R16), and the client decides what the server sends.

How the message is delivered:
- FCM HTTP v1 through the Admin SDK for both platforms. One credential (the function's service account) plus an APNs auth key uploaded once to the Firebase console. FCM is free.
- APNs direct for iOS. A second credential, an HTTP/2 APNs client inside the function and a second payload format, while Android still needs FCM. It gains nothing at two devices.
- Expo Push Service. Another hop and account outside Firebase, its own token type, and pruning via receipts it has to poll for. Its client library, `expo-notifications`, registers its own `FirebaseMessagingService` on Android, and Android delivers each push to only one such service, so it conflicts with the `@react-native-firebase` modules decision-1 already brings in.

The client library:
- `@react-native-firebase/messaging`. It hands back an FCM registration for both platforms (APNs is wrapped by FCM on iOS), has an Expo config plugin, and matches decision-1's native SDKs. Since v25 its permission APIs are deprecated in favour of `react-native-permissions` or `expo-notifications`. In the foreground it shows nothing and hands the message to `onMessage`.
- `expo-notifications` alone. Expo's own docs pair its iOS device token with APNs rather than FCM, which would push the server towards APNs direct or the Expo service. It also brings the Android service conflict above.

Registrations: FCM began moving from registration tokens to Firebase Installation IDs (FIDs) in June 2026, with both supported in parallel and no end date for tokens. `firebase-admin` 14.5.0 can already send to an `fid`. React Native Firebase's FID APIs (`register`, `onRegistered`, the `installationIdEnabled` plugin option) are on its main branch but not in 26.4.0.

## Decision

Assumed document paths (D4 owns the final shapes; this decision needs only these fields):
- `kitchens/{kitchenId}/activity/{activityId}`: `actorUid`, `kind`, `subject` (the item or meal name), `weekId`, `schemaVersion`.
- `kitchens/{kitchenId}/members/{uid}`: `push.enabled` (boolean, default false), `push.updatedAt`.
- `kitchens/{kitchenId}/members/{uid}/devices/{installationId}`: `address` (`{ kind: "token", value }`), `platform` (`ios` or `android`), `appVersion`, `updatedAt` (server timestamp). `installationId` is generated once by the id port and kept in local key-value storage.
- Security rules (R4, R49): a member can read and write only their own `push` field and their own `devices`. The partner's devices are never readable from a phone. The function uses the Admin SDK and is not bound by the rules.

Ports (`packages/ports/src/push/`, one port from R28 with three interfaces, each with a fake and a contract suite):
- `PushRegistrar` (phone): `requestPermission(): granted | denied | blocked`, `currentAddress()`, `onAddressChanged(cb)`, `release()`.
- `PushTargets` (server): `listOptedInDevices(kitchenId, exceptUid)`, `removeDevice(kitchenId, uid, installationId)`.
- `PushSender` (server): `send(messages): Outcome[]`, with `Outcome` one of `delivered`, `unregistered`, `invalid`, `transient`.

Core (`packages/core`, pure, no I/O):
- `planPartnerPush(activity, devices, now): { messages, stale }` sends only for `item.added` and `meal.added`, never to the actor, only to opted-in members. Devices whose `updatedAt` is older than 60 days are returned as `stale` and not sent to. The body is "<actor's display name> added <subject>". Each message carries `collapseId = kitchenId` and `data = { kitchenId, weekId, activityId }`.
- `devicesToPrune(outcomes)` returns the devices whose outcome is `unregistered` or `invalid`.

Application: a `notifyPartner` command that runs through the dispatcher (R32), with the activity id as its correlation id. It reads targets, calls `planPartnerPush`, sends, and removes stale and pruned devices.

Server provider (`packages/providers-server`):
- `AdminPushTargets` over `firebase-admin/firestore`.
- `FcmPushSender` over `getMessaging().sendEach()`. It maps `messaging/registration-token-not-registered` to `unregistered` and `messaging/invalid-registration-token` to `invalid`. `invalid-argument` maps to `transient`, because Firebase warns that a malformed payload also returns it.
- Payload: `notification { title: "Grocs", body }`; `android.notification.tag = kitchenId`; `apns.headers["apns-collapse-id"] = kitchenId`; `apns.payload.aps["thread-id"] = kitchenId`; plus `data`.

Composition root (`apps/functions/src/index.ts`):
- `onDocumentCreated({ document: "kitchens/{kitchenId}/activity/{activityId}", region: <the Firestore database's location>, retry: false, maxInstances: 2, memory: "256MiB" }, handler)`. Node.js 24 runtime, `firebase-functions` 7.4.0, `firebase-admin` 14.5.0.
- It wires the server providers through the instrumentation layer (R31) and dispatches `notifyPartner`.
- Under the emulator (`FUNCTIONS_EMULATOR === "true"`, read through the config port) it wires a `RecordingPushSender` instead of FCM. That sender writes each planned message to an emulator-only `_test/pushes/{activityId}` collection, which end-to-end flows assert on.
- `retry: false` means a failed send is logged and dropped. Duplicate deliveries from at-least-once execution replace the same notification because of the shared tag and collapse id.

Phone (`apps/mobile` with `providers-firebase`):
- `@react-native-firebase/app` and `messaging` 26.4.0 with their Expo config plugins in a development build.
- `ios.entitlements["aps-environment"] = "production"` in `app.json`. The APNs auth key (.p8) from the paid Apple Developer account is uploaded to the Firebase project.
- `react-native-permissions` 5.6.x with its Expo plugin (`iosPermissions: ["Notifications"]`) for the prompt. `requestNotifications(["alert", "sound"])` covers iOS and Android 13+ `POST_NOTIFICATIONS`. No `expo-notifications`.
- Turning pushes on in settings dispatches `enablePartnerPush`. It requests permission, which is the only place the OS prompt can appear (R24). If permission is denied it leaves the setting off and shows a link to the OS settings. If granted, it writes the device document and `push.enabled = true`, with its activity record, in one batch (R22).
- Turning pushes off sets `push.enabled = false`, deletes the device document and calls `deleteToken()`.
- At each start while pushes are enabled, the app rewrites the device document if the registration changed or `updatedAt` is over 7 days old. `onTokenRefresh` writes immediately.
- Foreground messages are ignored because R23's in-app message already covers them. `getInitialNotification` and `onNotificationOpenedApp` open the week in `data`.

Tests (R46 to R52, all without Docker or production access):
- Unit and property tests for `planPartnerPush` and `devicesToPrune`.
- Scenario tests for `notifyPartner` and `enablePartnerPush` on the fakes, including the actor's own device, opted-out members, stale devices and a burst of offline additions.
- `AdminPushTargets` contract tests against the Firestore emulator.
- `FcmPushSender` error mapping tested against recorded FCM error responses.
- Rules allow and deny tests for `push` and `devices`.
- An end-to-end flow on the emulators (Auth, Firestore, Functions): member B opts in, member A adds an item, and the flow asserts the `_test/pushes` record.

Ops: run `firebase functions:artifacts:setpolicy` (default 1 day) so old images don't accrue storage, and set a $1 monthly budget alert on the project.

## Consequences

- Cost on pay-as-you-go at two users is effectively nil. A few hundred activity records a month means about 1,000 invocations against a 2M monthly free tier, a few Firestore reads each against 50K a day, and FCM at no cost. Eventarc has no charge for Google-source events, though its Pub/Sub transport is billed at Pub/Sub rates, which is negligible at this volume. Deploy images stay under the 500 MB Artifact Registry free tier with the cleanup policy, and builds under 120 build minutes a day.
- FCM has no emulator, so a real delivery to a phone is never tested automatically. The first delivery on each platform is a manual check from a development build against a separate dev Firebase project, and the same check runs after any change to `FcmPushSender` or the APNs key.
- A burst of offline additions synced at once shows only the latest one ("Bruk added lemons"), because each send replaces the last. Opening the app shows the rest through the activity feed and R23. A digest ("and 6 more") would need delay or batching, which this rules out for now.
- The notification body names the item or meal. It passes through FCM and APNs and appears on the lock screen, the one place personal content leaves the kitchen's data outside Firebase storage. Bruk accepted this on Oct 18, 2026, recorded as a resolved area of concern in doc-1.
- Android uses FCM's default notification channel, because neither `notifee` nor `expo-notifications` is installed to create a named channel. Adding a "Partner additions" channel later needs a small native config plugin.
- `retry: false` trades a rare lost push for no retry loops. Pushes are a convenience here, and R23 covers the open app.
- Moving from tokens to FIDs is a provider change: once React Native Firebase releases its FID APIs, `address.kind` becomes `fid`, with a schema bump and migration test (R54). The ports, core and function stay the same.
- This depends on D4 keeping an activity collection under each kitchen with `actorUid`, `kind` and `subject`. If D4 names it differently, only the trigger path and the schema change.
- Still open: quiet hours, and notifying on edits, ticks or removals. Both are out of R24 today.

## Sources

- Expo SDK 55 changelog (Legacy Architecture dropped, push in Expo Go errors): https://expo.dev/changelog/sdk-55
- Expo SDK 56 changelog (Hermes v1 and worklets memory regression): https://expo.dev/changelog/sdk-56
- Expo SDK 58 changelog (React Native 0.88, expo-notifications changes): https://expo.dev/changelog/sdk-58
- Expo, sending notifications with FCM and APNs directly: https://docs.expo.dev/push-notifications/sending-notifications-custom/
- React Native Firebase, Expo installation: https://rnfirebase.io/
- React Native Firebase, messaging usage (permissions deprecated, foreground behaviour, Expo entitlements): https://rnfirebase.io/messaging/usage
- React Native Firebase messaging changelog (26.0.0 requires New Architecture, 25.0.0 deprecates permission APIs): https://github.com/invertase/react-native-firebase/blob/main/packages/messaging/CHANGELOG.md
- React Native Firebase messaging plugin source (FID option on main): https://github.com/invertase/react-native-firebase/tree/main/packages/messaging/plugin/src
- Single FirebaseMessagingService per Android app: https://getstream.io/video/docs/react-native/advanced/incoming-calls/advanced/firebase-messaging-conflicts/
- react-native-permissions README (Expo plugin, requestNotifications): https://github.com/zoontek/react-native-permissions
- FCM, managing registrations (FIDs, staleness, UNREGISTERED and INVALID_ARGUMENT): https://firebase.google.com/docs/cloud-messaging/manage-tokens
- FCM move to Installation IDs from 27 June 2026: https://borncity.com/news/firebase-cloud-messaging-umstieg-auf-installation-ids-ab-sofort/
- FCM iOS client setup (APNs auth key): https://firebase.google.com/docs/cloud-messaging/ios/client
- Cloud Functions Firestore triggers: https://firebase.google.com/docs/functions/firestore-events
- Cloud Functions retries and at-least-once execution: https://firebase.google.com/docs/functions/retries
- Managing functions (Artifact Registry cleanup policy): https://firebase.google.com/docs/functions/manage-functions
- Cloud Functions runtime support (Node.js 24 until 2028): https://docs.cloud.google.com/functions/docs/runtime-support
- Local Emulator Suite (no FCM emulator): https://firebase.google.com/docs/emulator-suite
- Firebase pricing (Blaze free quotas): https://firebase.google.com/pricing
- Eventarc pricing: https://cloud.google.com/eventarc/pricing
- npm registry, current versions (checked 2026-10-18): `@react-native-firebase/messaging` 26.4.0, `firebase-functions` 7.4.0, `firebase-admin` 14.5.0 (types include `fid` targets), `firebase-tools` 15.34.0, `react-native-permissions` 5.6.3, `expo` 58.0.14
