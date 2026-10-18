---
id: decision-7
title: >-
  Sync: an append-only change log folded in core, ordered by a hybrid logical
  clock
date: '2026-10-18 19:01'
status: proposed
---
## Context

Design question D4 in doc-1 (TASK-1.9): the sync model on Firestore (decision-1). It covers document shapes, field-level merges, set-not-toggle, tombstones, the activity record written atomically with each change, and schema versions with migration tests.

Requirements served:
- R15: a change shows on the other phone within 3 s.
- R16: everything works offline, across restarts, with no user action.
- R17: ticks record a state, never a toggle.
- R18: the later action wins per field, and different fields are both kept.
- R19: offline duplicates are never merged silently.
- R20: deletes never come back.
- R21: the app shows offline and pending.
- R22: an activity record is written in the same atomic write as its change.
- R25: the merge rules live in core.
- R30 and R54: versioned shapes and migration tests.
- R4 and R49: rules enforced on the server and tested.

What the skeleton does: one document per item at `kitchens/{k}/items/{id}`, schema v1. Each editable field is `{v, at, by}`, tombstoned with `deleted: {at, by}`, and badges are a sorted union. `FirestoreSyncStore.mergeItem` reads, merges with core's `mergeItem` and writes inside `runTransaction`.

What the code and SDK show:
- Firestore transactions fail when the client is offline (Firebase docs), so every `AddItem` made offline fails. R16 is not met.
- A plain write (`setDoc`, `updateDoc`, `writeBatch().commit()`) is applied to the local cache at once and queued. Its promise "does not resolve until the document is successfully created to the remote Firestore backend" (the `@firebase/firestore` 4.18 typings in the repo). So a command that awaits a write hangs offline. `AddItem` awaits `syncStore.mergeItem` today.
- Android and Apple SDKs persist the cache by default. `@react-native-firebase/firestore` 26.4.0 sets `persistence: true` by default (`lib/FirestoreModule.ts`).
- Queued writes are applied by the server in arrival order. Firestore's own docs call this "last write wins" per document. Arrival order is not action order: an untick made offline at 10:00 and synced at 11:00 would overwrite a tick made online at 10:30. That breaks R18, and a late write that clears a tombstone breaks R20.
- Security rules can compare `request.resource.data` with `resource.data` at no read cost, see `request.time`, and use `getAfter()` across a batch. Each `get`, `exists` or `getAfter` is billed as a read, with 10 access calls per single-document request and 20 per batch.

Options weighed:
1. Keep the transaction merge. It is correct online and fails R16 offline. Rejected.
2. Per-field writes (`updateDoc` with field paths), no guard. Works offline, but the server applies writes in arrival order, so an old queued field write beats a newer one (fails R18). Any write that sets `deleted: null` resurrects an item (fails R20 unless every writer is careful).
3. Per-field writes guarded by rules. State documents stay. Each changed field must carry a stamp later than the stored one, or the rules deny the write, and the native SDK drops the denied write from its queue and reverts the cache.
   - For: current state lives on the server, reads stay at one document per item, and rules can refuse edits to deleted items.
   - Against: core's comparison has to be duplicated in the rules language and kept in step. A losing offline write shows locally until the server denies it, so the item flickers. Losing a race arrives as `permission-denied`, mixed in with real permission errors. Correctness depends on how the native SDKs handle a denied write that was queued before a restart, which nobody has observed.
4. Queued commands (an outbox). Commands are kept in local key-value storage and replayed through a transaction or a callable function when online.
   - For: merges stay in one place (core).
   - Against: we would rebuild what the SDK's write queue already does, including persistence, retry, idempotency and an overlay of pending commands on the snapshot for the local view. A callable function adds cold starts that threaten R15, and offline is the case where all of this matters most.
5. An append-only change log. Each change is a new, immutable document. Phones never update or overwrite state documents, so the server has no conflicts to resolve. Each phone folds the week's changes with core's merge, which is commutative, associative and idempotent (R46).
   - For: offline works through the simplest path the SDK has (queued creates). The order changes arrive in cannot matter. A change document can be the activity record itself (R22 by construction). The merge exists once, in core, and the property tests are the guarantee.
   - Against: readers fold history instead of reading state. Change shapes are permanent, so every schema version must stay decodable. A cold listener reads a week's changes rather than its items.

Whose clock decides "later". There are three candidates:
- Server time. Firestore's commit time is arrival order, the very thing that breaks R18 for offline changes. It is also unknown while offline.
- The acting phone's wall clock. That is right for concurrent changes, but if the phones' clocks drift apart it breaks cause and effect. Shazya's phone, 2 minutes slow, unticks an item Bruk ticked 30 s earlier, which she can see ticked, and her untick still loses.
- The acting phone's clock, never earlier than what it has seen: a hybrid logical clock (Kulkarni and Demirbas). This is right in both cases.

## Decision

Use option 5: an append-only change log, where each change document is the activity record. Order changes by a hybrid logical clock stamp taken on the acting phone.

Clock. "Later" is decided by the stamp the acting phone writes, `{at, by, dev}`. Stamps compare by `at`, then `by` (uid), then `dev` (the installation id from decision-4, made once by the id port and kept in local key-value storage).
- The new core function `nextStamp(now, seen, by, dev)` returns `at = max(now, seen.at + 1)`. `now` is the clock port's reading, and `seen` is the highest stamp the phone holds for that record. A change is therefore always later than everything its author could see, whatever the clocks say.
- Device wall time decides only between changes where neither phone had seen the other's. Phones set their time from the network, so the error is small. Server time is used only as a bound in the rules, never for ordering.
- A tie is impossible between devices because of `dev`, and on one device because of the `+1`. Core's JSON tie-break stays as a defence.

Documents, all under `kitchens/{kitchenId}`:
- `kitchens/{k}`: `{schemaVersion, name, members: [uid, uid], timeZone, createdAt}`. Written only by the server functions for R2 and R3, which need a connection anyway.
- `kitchens/{k}/activity/{changeId}`: one change, immutable.
  - Fields: `{schemaVersion, kind, weekId, target: {type: "item" | "meal" | "week", id}, actorUid, stamp: {at, by, dev}, payload, subject?}`.
  - `changeId` comes from the id port. `actorUid` equals `stamp.by`.
  - `subject` (the name) is present on `item.added` and `meal.added` only, which is what decision-4's push trigger reads. It is the same collection and the same `actorUid`, `kind` and `subject` that decision-4 assumed.
- Kinds in schema v1, with their payloads:
  - `item.added` `{name, amount, aisle, badges: mealId[]}`
  - `item.set` `{field: "name" | "amount" | "aisle" | "state" | "cleared", value}`
  - `item.badged` `{mealId}`
  - `item.deleted` `{}`
  - `meal.added` `{dayIndex, name, link}`
  - `meal.set` `{field: "name" | "link", value}`
  - `meal.deleted` `{}`
  - `pair.declined` `{a, b}` (R12)
  - D1 may add `item.combined`.
- `kitchens/{k}/aisles/{nameKey}`: `{schemaVersion, aisle: {v, at, by, dev}}`, the suggestion memory for R11 and R14. `nameKey` is `encodeURIComponent(normaliseName(name))`. It is written in the same batch as an `item.added` or `item.set aisle`. It is a projection, not a change, so it has no activity record.
- `kitchens/{k}/members/{uid}` and its `devices` subcollection are as decision-4 has them.

Merge, all in `packages/core` (pure, with property tests in `src/merge/`):
- `foldWeek(changes): WeekView` groups changes by target.
- An item exists only once its `item.added` is present. Until then, changes for it are held and not shown.
- Each field is last-write-wins by stamp, starting from the `item.added` values.
- Badges are the union of `added.badges` and every `item.badged` (grow-only). Shown badges leave out deleted meals, which is how a meal's removal clears its badge without touching items (R8).
- `item.deleted` is permanent. Any later change to that item is ignored (R20). Meals work the same way.
- `cleared` is an ordinary last-write-wins field. Clear the cart writes one `item.set cleared=true` per in-cart item in one batch. A cleared item is hidden and stays in the aisle memory (R14).
- `combineCandidates(view)` lists visible items with equal `normaliseName` that are not in a declined pair. Items are never merged by name. Each `item.added` has its own random id, so two offline additions of "milk" are two items and raise the R12 prompt (R19).
- Tick and untick write `item.set state` with the resulting value, never a toggle (R17).
- Property tests: for any list of changes, shuffled, duplicated or split in two, the fold is the same. A delete is never undone. Two adds with the same name always give two items.

Port (`packages/ports/src/sync-store/`). The interface is replaced, with fake and contract updated to match:
- `append(kitchenId, changes: Change[], projections?: AisleMemory[]): void`. One atomic batch. It returns once the batch is in the local cache, never waiting for the server.
- `watchWeek(kitchenId, weekId, onChanges)`.
- `watchSyncState(kitchenId, onState: {connected: boolean, pending: number})` for R21.
- `watchRejections(kitchenId, onRejected: {changeIds, code})`.
- `aisleFor(kitchenId, nameKey)`.
- Commands build changes in core (`nextStamp`, then `itemAdded`, `itemSet` and so on) from the application's in-memory `WeekView`. They never read from the server.

Provider (`packages/providers-firebase/src/firestore-sync-store.ts`):
- `append` uses `writeBatch`, one `set` per change, and calls `commit()` without awaiting it. A rejected commit is sent to `watchRejections`.
- `watchWeek` is `onSnapshot(query(activity, where("weekId", "==", w)), {includeMetadataChanges: true})`, decoding every document with core's codec.
- `watchSyncState` derives `connected` from `!metadata.fromCache` and `pending` from the documents with `hasPendingWrites`.
- `runTransaction` is removed from `FirestoreFns`. A new rule in `tools/checks` (D8), `sync/no-transactions`, fails any use of it under `packages/providers-firebase` or `apps/mobile`: "transactions fail offline (R16)".

Security rules (`firebase/firestore.rules`, each with allow and deny tests, R49):
- `activity`:
  - create if the writer is a member, `actorUid == stamp.by == request.auth.uid`, `schemaVersion` is in the accepted list, `kind` is known, the keys and payload match the kind (`keys().hasOnly`), names are 1 to 200 characters, a link matches `^https?://` and is at most 2,000 characters (R6), and `stamp.at <= request.time.toMillis() + 600000` (no stamps more than 10 minutes ahead);
  - update only if the new data equals the old, so a re-sent create is harmless;
  - never delete.
- `aisles`: write if the writer is a member and the new `aisle.at` is later than the stored one. This needs no extra read.

Schema versions (R30, R54):
- `packages/core/src/schema/activity.ts` exports `ACTIVITY_SCHEMA_VERSION = 1`, `encodeChange`, and `decodeChange`. `decodeChange` accepts every version up to the current one and upgrades older versions step by step (`v1ToV2` and so on), because change documents are never rewritten.
- A version newer than the app's decodes to `unsupported-version`. The fold skips it, and the app shows "update Grocs to see all changes". This covers one phone updating before the other.
- `schema/fixtures/activity.v<n>.json` holds a sample of each kind as written at version n. `activity.migration.test.ts` decodes every fixture with the current codec and asserts the result.
- D8's `schema-versions` check fails when `encodeChange(sample)` no longer equals the newest fixture (the shape changed without a bump), or when a version has no fixture.
- Bumping a version means: deploy rules that accept the new version, then ship the app.
- The skeleton's `ItemDoc` v1 and `items` collection are deleted, not migrated. They exist only in emulator seed data, and no production data exists. `firebase/seed/` is rewritten as changes.

Before this is accepted, spike TASK-1.16 must confirm on the Pixel 10 Fold (Android 16) and the iPhone, with `@react-native-firebase/firestore` 26.4.0 in a development build against a dev project (the emulator cannot show device persistence behaviour):
1. A batch committed in airplane mode shows in `onSnapshot` at once, with `hasPendingWrites`.
2. After the app is killed and relaunched offline, the batch is still shown and still pending. After an iOS background kill too.
3. On reconnection the batch reaches the server without any app code running, and the other phone gets it within 3 s.
4. A batch the rules deny, sent before a restart, is dropped and the cache reverts. Nothing re-sends it forever.
5. Relaunched offline for more than an hour (past the ID token's lifetime), auth restores the user and the queued writes go through once online.
6. How quickly `fromCache` turns true and false when airplane mode is toggled, for R21.
7. Each phone's clock offset from `request.time`, from a test write carrying `serverTimestamp()` beside `stamp.at`, with automatic time on, and what happens when it is off.
8. Every modular function the provider uses exists in the native module with the same call shape: `writeBatch`, `doc`, `collection`, `query`, `where`, `orderBy`, `limit`, `onSnapshot` with `includeMetadataChanges`, `serverTimestamp`.

## Consequences

- R16 rests on the SDK's simplest offline path, queued creates, and on nothing we write ourselves. R18, R19 and R20 rest on core's fold and its property tests. The rules check shape and authorship, not order, so the rules and core never have to agree on the merge.
- Reads grow with history, not with list size. A busy week is about 40 items with roughly 4 changes each, plus 10 meals, so about 180 documents. A listener that has been disconnected for more than 30 minutes is billed as a new query, so 2 phones times 10 cold opens a day is about 3,600 reads against 50,000 free. Each write also costs a `get()` for membership. If weeks grow far past this, a server-side snapshot per closed week is the fix. It is not built now.
- No document holds an item's current state. The push function (decision-4) needs only the change. Any later server-side reader (a digest, an export) has to fold with core, which is possible because core is shared.
- The activity feed records changes that turned out to have no effect, for example a tick on an item the other member had already deleted. The feed shows history, folded the same way, so it can say "lemons (removed)".
- Every schema version is permanent, and upgrade functions pile up in core. Old fixtures can never be deleted.
- A phone whose clock runs more than 10 minutes fast has its writes rejected. They then disappear after the server answers, and the only trace is a `sync.rejected` log record (D7). A visible warning is open, as is reading the offset from (7).
- Concurrent edits between two phones whose clocks differ are decided by that difference. With network time it is well under the gap between two people's taps, and that is accepted.
- `AddItem` and every later command change from awaiting the store to returning after `append`. The two-client emulator test stays (R15). A new emulator test runs `disableNetwork` and `enableNetwork` on the web SDK for (1) and (3), but only the spike shows (2), (4) and (5) on the native SDK.
- What this rules out: transactions on the phones, server-side "current item" queries, and ids derived from names.
- Still open: D1's combine kind, the per-week snapshot if needed, the clock-skew warning, and the stamp bound if the spike shows larger offsets.

## Sources

- Firebase, Transactions and batched writes ("Transactions will fail when the client is offline"; batches are atomic): https://firebase.google.com/docs/firestore/manage-data/transactions
- Google Cloud, Firestore enable offline data (persistence on by default on Android and Apple, 100 MB cache, queued writes, `fromCache`, `includeMetadataChanges`): https://docs.cloud.google.com/firestore/native/docs/manage-data/enable-offline
- Firebase, Writing conditions for security rules (access-call limits 10 and 20, billed as reads, `getAfter`): https://firebase.google.com/docs/firestore/security/rules-conditions
- Google Cloud, Firestore pricing (free quota, listener billing, re-listen after 30 minutes): https://cloud.google.com/firestore/pricing
- React Native Firebase, Firestore reference: https://rnfirebase.io/reference/firestore
- Kulkarni, Demirbas et al., Logical Physical Clocks (hybrid logical clocks): https://www.cse.buffalo.edu//~demirbas/publications/hlc.pdf
- Repository evidence: `node_modules/@firebase/firestore/dist/index.d.ts` 4.18.0 (write promises resolve only on server acknowledgement); `node_modules/@react-native-firebase/firestore/lib/FirestoreModule.ts` 26.4.0 (`persistence: true` default) and `lib/modular.ts` (`writeBatch`, `onSnapshotsInSync`, `waitForPendingWrites`); `packages/providers-firebase/src/firestore-sync-store.ts`, `packages/core/src/merge/`, `packages/application/src/commands/add-item.ts`; TASK-1.4 findings; decision-4 (activity path and fields)
