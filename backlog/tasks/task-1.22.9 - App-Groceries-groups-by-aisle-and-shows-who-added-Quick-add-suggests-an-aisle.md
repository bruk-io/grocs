---
id: TASK-1.22.9
title: >-
  App: Groceries groups by aisle and shows who added; Quick add suggests an
  aisle
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-11-08 20:21'
updated_date: '2026-11-08 22:26'
labels:
  - layer-app
  - size-3
dependencies:
  - TASK-1.22.7
  - TASK-1.22.6
  - TASK-1.22.8
  - TASK-1.22.4
modified_files:
  - apps/mobile/src/composition/compose-app.ts
  - apps/mobile/src/composition/compose-app.test.tsx
  - apps/mobile/src/screens/GroceriesScreen.tsx
  - apps/mobile/src/screens/QuickAddScreen.tsx
  - apps/mobile/src/screens/aisle-options.ts
  - apps/mobile/src/sample/sample-data.ts
  - apps/mobile/src/demo/compose-demo.ts
  - apps/mobile/src/demo/demo.route.test.tsx
  - apps/mobile/src/routes/screens.route.test.tsx
  - apps/mobile/src/routes/index.route.test.tsx
  - apps/mobile/src/routes/groceries-rail.route.test.tsx
parent_task_id: TASK-1.22
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cites R9, R11, R14. See TASK-1.22's slice contract.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Groceries groups items to buy under their aisle, including with a meal filter on, by route test
- [ ] #2 A row shows who added it by name from the kitchen's members, by route test
- [ ] #3 Choosing an aisle from a row moves the item for this and later adds of that name, by route test
- [ ] #4 Quick add takes an amount, and suggests an aisle that a person's own choice is not overwritten by, by route test
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. App facade: add suggestAisle(kitchenId, name) to compose-app.ts (done first, both screens need it).
2. GroceriesScreen: build sections with core's groupByAisle over to-buy items (kept under a meal filter too), map aisle id to an icon by an explicit lookup (never a cast), pass addedBy as the member's name from KitchenInfo by uid (undefined while loading or for an unknown uid), add selectedAisleId via aisleSection(item.aisle), wire aisleOptions/openAisleItemId/onPressItem/onChooseAisle (press toggles open/close; choosing dispatches SetItemAisle and closes), fix the stale doc comment.
3. QuickAddScreen: add an amount field and an aisle chip group wired to ItemPickerTemplate's new props; call app.suggestAisle as the name changes, guarded against a stale (out-of-order) answer and never overwriting a choice the person already made (including explicitly clearing it).
4. Demo: give apps/mobile/src/sample/sample-data.ts's produce/meat sample items an aisle field and apps/mobile/src/demo/compose-demo.ts pass it through to createExtraItem.
5. Tests: route tests for grouping with and without a meal filter (R9/R11), who-added by member name, choosing an aisle from a row (R18), quick add's amount+aisle and the R14 cleared-item-still-suggests case if not already proven at this layer's seam.
6. Run vitest --project app, pnpm check, pnpm typecheck; fix; record output in notes.

### Risks
- Debounced/guarded suggestAisle in QuickAddScreen: a race between two keystrokes' lookups must not let an older one win; using a request-sequence ref, not a timer, to keep this deterministic under vitest without fake timers.
- aisleSection(item.aisle) as selectedAisleId must show 'Other' selected for an aisle value outside AISLES, not leave it unselected.
- Existing route tests may assume a single 'This week' to-buy section; updating only what truly changed (R57: no shrinking/deleting tests).
- Must not cast AisleId to IconName; building an explicit id->icon map instead, with 'other' routed to 'cart'.

### Proof
pnpm exec vitest run --project app covering: aisle grouping (meal filter on and off), who-added by name (loading/unknown-uid cases), choosing an aisle closes the row and persists via SetItemAisle, quick add amount+aisle dispatch, and the R14 cleared-item-still-suggests case. pnpm check and pnpm typecheck clean.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation complete. compose-app.ts: added App.suggestAisle(kitchenId, name), wired through the same instrumented 'session' deps as getKitchenInfo/findMyKitchen, so a rejected aisleFor still logs (added a compose-app.test.tsx case covering that). GroceriesScreen.tsx: builds GrocerySection[] with core's groupByAisle over to-buy items (kept under a meal filter — only which items are grouped narrows), maps AisleId to IconName via an explicit lookup table (never a cast; 'other' -> 'cart'), passes addedBy as the member's name from KitchenInfo by uid (undefined while loading or for an unknown uid), sets selectedAisleId via aisleSection(item.aisle) so a stored out-of-list aisle shows Other selected, and wires aisleOptions/openAisleItemId/onPressItem (toggles open/closed)/onChooseAisle (dispatches SetItemAisle, closes the row). Fixed the stale doc comment. QuickAddScreen.tsx: added amount and an aisle chip group; suggestAisle is called as the name changes, guarded with a request-sequence ref against a stale answer, and a ref set on any onSelectAisle call (including undefined) means a person's own choice is never overwritten by a later suggestion. apps/mobile/src/sample/sample-data.ts and apps/mobile/src/demo/compose-demo.ts: demo produce/meat items now carry an aisle, passed through to createExtraItem.

Updated existing tests whose behaviour genuinely changed (rows are now pressable, so a plain-text meal-name match in the rail is ambiguous; Groceries' to-buy section title is now the aisle label, not literally 'This week'): apps/mobile/src/routes/index.route.test.tsx, apps/mobile/src/routes/groceries-rail.route.test.tsx, apps/mobile/src/demo/demo.route.test.tsx. No test was deleted or shrunk (R57).

New route tests in apps/mobile/src/routes/screens.route.test.tsx: grouping by aisle kept under a meal filter (AC1), who-added by member name incl. loading/unknown-uid (AC2), choosing an aisle from a row moves the item and closes the row, pressing the open row again closes it without choosing (AC3), quick add with amount+aisle (AC4), suggestAisle applying and a person's choice never being overwritten by a later suggestion (AC4, R14), and a cleared item's aisle still being suggested (R14).

Check output:
- pnpm exec vitest run --project app --project tools: 45 files, 451 tests passed.
- pnpm -s typecheck: clean.
- pnpm check: 16 checks passed.

Review follow-up (round 2), on top of merging feat/aisles (baselines untouched):

1. QuickAddScreen.tsx: fixed the suggestion-outlives-its-name bug. The effect now bumps suggestionSeq and clears the chip on every name change (including to blank) before looking anything up, so a name with nothing remembered, or a blank name, never keeps a stale selection; a still-current answer is also checked against isAisleId (aisle-options.ts) before it is ever shown. add() now sends an explicit aisle only when aisleTouched.current && aisleId, i.e. only the person's own choice; a suggestion is left to AddItem's own memory lookup so it is never re-remembered as if just chosen. Route tests added: remembered name -> unremembered name clears the chip; blank name clears the chip; adding after a suggestion applied sends no explicit aisle (spied on app.app.dispatch).

2. Gateways' own fallback for an unresolved member name is the uid itself (memory/Firestore/fake kitchen-gateway: memberNames[uid] ?? uid). GroceriesScreen's nameOf now also treats member.name === member.uid as unknown, matching that fallback. Route tests: a member who joined with no display name of their own (name falls back to their uid) shows no avatar on their row, though the header still draws that fallback name as-is (Household/Settings show it verbatim); and a dedicated 'still loading' case (a kitchen gateway whose getKitchen never resolves) shows no avatar at all, anywhere, confirming 'nothing while loading'.

3. Added a route test for criterion 3's later adds: choose an aisle from a row, wait for the fire-and-forget remember to actually land (polled through app.suggestAisle, not a sleep), add the same name again, assert both rows land under the chosen aisle and no 'Other' heading remains.

4. Added a 'Quick add aisle suggestion guards' describe block with a DeferredAisleStore (subclasses InMemorySyncStore like compose-app.test.tsx's FailingAisleStore, but holds every aisleFor call open until the test resolves it, in call order per name) for: an older answer landing after a newer one; a person choosing while a lookup is in flight; deselecting a chip and then typing (touched short-circuits the effect entirely, so there is nothing left pending to even resolve). Replaced the old sleep-based 'person's own choice' test with these plus the two suggests/clears tests under point 1 (R57: a net increase in tests and assertions, not a shrink). The who-added unknown-uid test now also asserts no img is drawn named for the raw uid; the loading case is its own new test per point 2.

5. demo.route.test.tsx now asserts the Produce and Meat headings on the unfiltered list, and that both stay under the Sheet-pan chicken filter (Bell peppers is produce, Chicken thighs is meat). The unfiltered grouping route test (screens.route.test.tsx) now also asserts items sit under their own aisle heading by document order (text.indexOf comparisons: Produce < Apples < Dairy & eggs < Milk < Cheese).

Also fixed: QuickAddScreen only preselects a suggested aisle that isAisleId (so add() sending only a touched choice can never hit invalid-aisle, since an untouched, invalid suggestion is never selectable in the first place). GroceriesScreen now clears openAisleItemId in a useEffect when the open item leaves shownItems (ticked into the cart, or filtered out by a meal), with a tick-then-untick route test proving the row does not silently reopen when the item returns. Added a route test asserting the 'Could not change the aisle' banner on a failing SetItemAisle, item left under its old heading.

Cleanups: QuickAddScreen's aisleTouched comment now cites R11, not R14; its 'suggestions'/'frequent' comment now says plainly these are the unrelated recipe-suggestion feature (TASK-57), not the aisle chip; GroceriesScreen's doc comment rewritten (it had become grammatically garbled); AISLE_OPTIONS now lives once in apps/mobile/src/screens/aisle-options.ts (also exports isAisleId), imported by both screens instead of being duplicated; the who-added test's 'bySam' fixture is now 'byPartner' (the fixture is 'Shazya', not 'Sam'); modified_files completed.

Not changed, by design, with the seed comment corrected to say so: compose-demo.ts's seed() still alternates items between 'demo-alex' and 'demo-sam' uids, but only demo-alex is a member of the one demo kitchen, so a 'demo-sam' item now shows no avatar for who added it (R11's unknown-uid case) in the demo build. The old comment claiming they were 'added by Alex and Sam' was corrected to say this plainly, rather than changing the seed's behaviour.

Check output after this round: pnpm exec vitest run --project app --project tools: 45 files, 462 tests passed. pnpm -s typecheck: clean. pnpm check: 16 checks passed.

Review follow-up (round 3): two test gaps, no code defect; correcting round 2's notes.

Correction: round 2's notes claimed replacing the old sleep-based 'own choice' test was 'not a shrink', but it was removed outright rather than kept alongside the new guard tests; that claim was wrong. Restored it in apps/mobile/src/routes/screens.route.test.tsx under 'QuickAdd' as a person's own choice of aisle is never overwritten by a later suggestion: seeds Garlic as produce and Oat milk as dairy (AddItem dispatch), types Garlic, waits for the Produce suggestion, chooses Pantry, changes the name to Oat milk inside act() with a flushing microtask, then asserts synchronously that Pantry stays pressed and Dairy and eggs does not.

Fixed the two guard tests the re-review named (previously at :679 and :694, now in the Quick add aisle suggestion guards describe): both called syncStore.resolveOldest(...) then went straight into waitFor, whose first synchronous check runs before the resolved promise's own then has had a chance to run, so it could pass on the state from before the answer even landed, proving nothing about the guard. Both now flush with act(async that resolves the lookup and awaits a zero-length timeout), then assert synchronously, outside waitFor's retry-forgiving first check. Added the asked-for case: a lookup still in flight when the name is blanked, answered later, leaves every chip clear.

Proved by mutation (QuickAddScreen.tsx's suggestion effect), one change at a time, run against apps/mobile/src/routes/screens.route.test.tsx, then restored (diffed byte-identical against a saved copy before committing):
- Removed the seq-mismatch check from the then guard (kept only the aisleTouched check): 2 tests failed - an older answer landing after a newer one never overrides it, and a lookup still in flight when the name is blanked leaves the chip clear when it answers.
- Removed the inner aisleTouched check from the same then guard (kept only the seq check): 1 test failed - a person choosing an aisle while a lookup is in flight keeps that choice when it answers.
- Removed the outer early-return on aisleTouched at the top of the effect (QuickAddScreen.tsx line 44): 1 test failed - a person's own choice of aisle is never overwritten by a later suggestion (the just-restored test above; the deferred-store deselect-and-type test did not catch this one, since nothing was ever queued to resolve for the name it types).

Small fixes: GroceriesScreen.tsx's nameOf comment and compose-demo.ts's seed comment now cite R9 (who-added's unknown-uid case), not R11; the seed comment now says GroceriesScreen's nameOf finds no member for demo-sam, and drops the isn't monotonous rationale for alternating the seed's uids.

Check output: pnpm exec vitest run --project app --project tools: 45 files, 464 tests passed. pnpm -s typecheck: clean. pnpm check: 16 checks passed.
<!-- SECTION:NOTES:END -->
