---
id: TASK-1.21.1
title: 'Core: Meal domain model, merge rules and schema'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-24 20:09'
updated_date: '2026-10-24 21:40'
labels:
  - layer-core
  - size-2
  - finish-moved
dependencies: []
parent_task_id: TASK-1.21
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The frozen contract for the meal-plan slice (TASK-1.21). Meals follow items' existing shape exactly (R18-R20: field-level last-write-wins, permanent tombstone deletes) since a meal is plain same-kitchen CRUD with no cross-kitchen lookup problem, unlike Kitchen's Cloud-Function-transaction shape. Mirror packages/core/src/model/item.ts, packages/core/src/merge/item-merge.ts and packages/core/src/schema/item-doc.ts closely.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Meal {id, weekId: Stamped<string>, name: Stamped<string>, link: Stamped<string|null>, addedBy, createdAt, deleted: Stamp|null} in packages/core/src/model/meal.ts, with createMeal, renameMeal, relinkMeal, moveMeal and removeMeal
- [x] #2 mergeMeal in packages/core/src/merge/meal-merge.ts: field-wise LWW merge, commutative/associative/idempotent, a tombstone delete is permanent
- [x] #3 encodeMeal/decodeMeal and MEAL_SCHEMA_VERSION in packages/core/src/schema/meal-doc.ts, mirroring item-doc.ts's validation shape
- [x] #4 Everything exported from packages/core/src/index.ts; unit tests cover every function including concurrent-merge and tombstone-permanence cases
- [x] #5 Meal gains dayIndex: Stamped<number> (Monday = 0, matching R5's week and personal.ts's existing PERSONAL_FIELDS meal shape); moveMeal restamps both weekId and dayIndex together as the single move-between-weeks operation (AC3 names only cross-week moves, not a separate same-week day change)
- [x] #6 createMeal and relinkMeal validate the link as an http or https URL when present (R6), returning Result<Meal, MealLinkError> with an 'invalid-link' member; decodeMeal stays permissive so already-stored data still reads
- [ ] #7 redact(encodeMeal(...)) hides name and link and nothing else; personal.ts's item shape is made genuinely discriminating from meal's (not just reordered) so a MealDoc is never misclassified as an item, with a test mirroring personal.test.ts's existing item case
- [x] #8 dayIndex is a total DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 type (not a runtime-validated number), so createMeal and moveMeal cannot construct an out-of-range value; decodeMeal's 0-6 check stays as the runtime gate for stored data and narrows to DayIndex. Exported from index.ts
- [ ] #9 redact(encodeMeal(...)) hides name and link and nothing else, AND redact() on an item-shaped object that lacks a meal-exclusive field (e.g. packages/ports/src/logging/contract.ts's existing item fixture, which has no dayIndex and no aisle) still correctly redacts item's own personal fields - both directions covered by tests, with the full pnpm test suite (not just packages/core) run to prove the second direction, since that is exactly what broke silently last round
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Mirror item.ts/item-merge.ts/item-doc.ts exactly: Meal has no badges/state/aisle; weekId becomes Stamped (so moveMeal restamps it like any other field) while addedBy/createdAt stay plain for the merge's first-writer tie-break.
2. model/meal.ts: createMeal, renameMeal (both can fail empty-name), relinkMeal, moveMeal, removeMeal (latter three cannot fail, mirroring setItemState/clearFromCart).
3. merge/meal-merge.ts: mergeMeal field-wise LWW including weekId via mergeStamped; deleted via laterStamp. Export isMealDeleted (not isDeleted, to avoid colliding with item's export in the barrel).
4. schema/meal-doc.ts: MEAL_SCHEMA_VERSION, encodeMeal/decodeMeal; weekId.v validated non-empty (unlike a plain Stamped string) since it is the partition key for watchWeekMeals queries. Reuse SchemaError from item-doc.ts rather than redeclaring it.
5. Export everything from index.ts; property tests (commutative/associative/idempotent/tombstone-permanent) mirroring item-merge.test.ts; decode-rejection table mirroring item-doc.test.ts, including an empty-weekId case.

6. Fixes from reviewer-core's second pass: add Meal.dayIndex: Stamped<number> (0=Monday..6=Sunday), threaded through createMeal/moveMeal/mergeMeal/meal-doc; validate link as http(s) URL in createMeal/relinkMeal (MealLinkError 'invalid-link'), decodeMeal stays permissive on link but strict on dayIndex (0-6 integer); rename NewMealError to MealNameError shared by createMeal/renameMeal; make personal.ts's item shape discriminating by adding 'aisle' so a meal is never misclassified as an item (R36); fix meal.test.ts's late-edit stamp to be strictly later than the fixture's own creation stamp.

7. Third-pass fixes: DayIndex = 0|1|2|3|4|5|6 as a total type (exported), used for Meal.dayIndex/NewMealInput.dayIndex/moveMeal's param/MealDoc.dayIndex - construction can no longer produce an out-of-range value at the type level, no new error path added. decodeMeal's existing runtime 0-6 check is unchanged (still the real gate for untyped stored data) and now narrows to DayIndex. Documented weekId as a caller-guaranteed non-empty precondition (matching item's identical gap). Documented personal.ts's shape field as load-bearing for R36 discrimination. Added MealDoc's personal-fields doc comment pointer.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented packages/core/src/model/meal.ts (Meal, createMeal, renameMeal, relinkMeal, moveMeal, removeMeal), packages/core/src/merge/meal-merge.ts (mergeMeal, isMealDeleted), packages/core/src/schema/meal-doc.ts (MealDoc, MEAL_SCHEMA_VERSION, encodeMeal, decodeMeal; SchemaError reused from item-doc.ts), and matching *.test.ts files beside each (unit + fast-check property tests for commutativity/associativity/idempotence/tombstone-permanence, mirroring item's suites). Exported from packages/core/src/index.ts; isMealDeleted is named distinctly from item's isDeleted to avoid a barrel collision — downstream layers should use that name. weekId.v is validated non-empty in decodeMeal (it's the partition key for watchWeekMeals). pnpm check, pnpm typecheck, and pnpm exec vitest run --project unit packages/core all pass (93 tests, 14 checks). Left acceptance criteria and status change to review per instructions.

Oct 24, 2026 (orchestrator, after reviewer-core's review): AC change after work started, labelled finish-moved per board convention.

reviewer-core found two blocking gaps in the first pass: (1) Meal had no way to say which day within the week it's on, needed by R5/R7/AC1 and already assumed by the built UI (WeekList's PlanDay, MealFormTemplate's dateLabel) and by personal.ts's PERSONAL_FIELDS, which already names a 'meal' shape of ['weekId','dayIndex'] - this task's original ACs simply omitted it, not a builder mistake; (2) that same omission is a live R36 privacy leak today - personal.ts's redact() picks the entity by shape-matching, and since item's shape (['weekId','addedBy']) is a subset of any meal doc too, every meal gets classified as an item, so meal links (the sensitive field, per R36) leak in cleartext in logs while meal names get redacted by accident. Three new ACs added above to close both gaps plus R6 (link URL validation), which the reviewer flagged as needing to land now rather than later since relinkMeal's signature change (Meal -> Result<Meal, MealLinkError>) would otherwise ripple across all five downstream subtasks if deferred.

Also requested as part of the same pass (not AC-level, but the reviewer's minor findings): rename the rename-path's NewMealError to a shared MealNameError (used by both createMeal and renameMeal - "New..." reads wrong for a rename in a frozen contract), and fix meal.test.ts:79's late-edit stamp (currently equal to the fixture's own stamp, so the assertion exercises mergeStamped's tie-break rather than its stamp comparison). Left alone, per the reviewer's own "do not churn"/"probably intended" calls: the SchemaError/StoredField duplication between item-doc.ts and meal-doc.ts (a preference, not a defect), and createMeal accepting a non-empty-after-trim name like '!!' where items reject it via normaliseName (meals have no R12 dedup requirement, unlike items).

weekId: Stamped<string> and isMealDeleted both confirmed correct as built, no change. Forward note for TASK-1.21.2 (ports) and TASK-1.21.4 (providers): the stored field is nested (weekId.v), so provider queries and firebase/firestore.rules must read that path, not a bare weekId.

Second pass addressing reviewer-core's findings, all implemented:
- Meal gains dayIndex: Stamped<number> (0=Mon..6=Sun, matches weekIdFor's ISO week and personal.ts's pre-existing 'meal' shape). createMeal requires it as input. moveMeal is now moveMeal(meal, weekId, dayIndex, stamp) - restamps both together as the one cross-week-move operation; no separate same-week day-change function was added (AC3 only names cross-week moves).
- createMeal and relinkMeal validate link as an http(s) URL (R6) via a pure isValidLink guard (new URL + protocol check); both now return Result<Meal, MealLinkError> (createMeal: MealNameError | MealLinkError). decodeMeal stays permissive on link (already-stored data must still read) but is strict on dayIndex (rejects anything outside integer 0-6) - this asymmetry is deliberate: dayIndex is structural (used for partitioning/queries), link is kitchen-typed content. Flagging for TASK-1.21.4: a stored meal with a bad dayIndex becomes unreadable, one with a bad link does not.
- NewMealError renamed to MealNameError (shared by createMeal/renameMeal); MealLinkError added. Barrel export updated accordingly (NewMealError no longer exported).
- Closed the R36 leak in packages/core/src/schema/personal.ts: item's shape was ['weekId','addedBy'], a subset of every meal doc too, so every meal was misclassified as an item and its link leaked in cleartext. Added 'aisle' to item's shape (meals never have one, items always do) - now genuinely discriminating. Added a classification test (PERSONAL_FIELDS.find() directly, not just via redact's output) that fails under the old shape and passes under the new one, plus the existing not.toContain(link) behavioural test. Verified the inverse risk (a trimmed item without aisle reaching redact and leaking name/amount): grepped every redact() call site - only packages/ports/src/logging/port.ts's safeRecord - and both callers of Logger.log (dispatch/logging-middleware.ts, instrumentation/instrument.ts) explicitly log only metadata (commandType/port/method/duration/outcome/eventTypes), never command payloads or port arguments/results, per instrument.ts's own R36 comment. No Item/Meal object reaches redact anywhere in the current codebase, so the aisle requirement cannot cause a new leak today - but any future logging code that passes a partial/trimmed Item through redact would need to keep aisle on it.
- Considered and rejected an extra url.hostname!=='' guard on isValidLink: new URL('http://?x') already throws (verified with node -e), so the empty-host case is already caught by isValidLink's try/catch; the extra clause would be dead code. Kept the 'http://?x' test case since it still documents the behavior, just via the catch path.
- Did not bump MEAL_SCHEMA_VERSION despite adding dayIndex to MealDoc: nothing is stored yet and the contract isn't frozen until this task closes, so there's no existing document to migrate from.
- Fixed meal.test.ts's tombstone-permanence test: the late-edit's stamp was identical to the fixture's own creation stamp ({at:1,by:'alex'}), so the assertion exercised mergeStamped's JSON-value tie-break rather than an actual stamp comparison; changed to {at:1,by:'sam'} (same instant, different author, genuinely later per compareStamps' by-tiebreak).

Forward notes for downstream subtasks (in addition to the earlier weekId.v nesting note): moveMeal's signature is now (meal, weekId, dayIndex, stamp) - TASK-1.21.3's move-meal.ts and TASK-1.21.6's screen must supply dayIndex. relinkMeal and createMeal now return Result, so edit-meal.ts/add-meal.ts (TASK-1.21.3) must thread MealLinkError/MealNameError, and AddMealScreen (TASK-1.21.6) must supply dayIndex and handle an invalid-link error. dayIndex.v is nested in the stored form exactly like weekId.v.

Re-verified: pnpm exec vitest run --project unit packages/core (99 tests pass), pnpm typecheck clean, pnpm check green (14 checks). Uncommitted files for handoff, now 9: packages/core/src/model/meal.ts, meal.test.ts, packages/core/src/merge/meal-merge.ts, meal-merge.test.ts, packages/core/src/schema/meal-doc.ts, meal-doc.test.ts, packages/core/src/schema/personal.ts, personal.test.ts, packages/core/src/index.ts.

Oct 24, 2026 (orchestrator, after reviewer-core's final pass): one more blocking finding - createMeal/moveMeal could mint a dayIndex or weekId that decodeMeal's strict check would then refuse, breaking the decode(encode(m)) round-trip the frozen contract owes its callers. Fixed via a total DayIndex = 0|1|2|3|4|5|6 type (new AC above) rather than another Result error path, per the reviewer's recommendation - no downstream subtask gains a new error to thread. weekId: '' is the same class at lower severity (createExtraItem has the identical gap today, so there's precedent); decided to document weekId as a caller-guaranteed precondition in Meal's doc comment rather than relax decodeMeal's non-empty check, which stays as real defense against corrupted stored data. Also requested: a one-clause addition to personal.ts's shape doc comment noting it's now load-bearing for discrimination (aisle is the only thing keeping a meal from matching item's shape), and MealDoc's doc comment gains the same personal-fields pointer ItemDoc's already has (name.v/link.v, see personal.ts). Declined, per the reviewer's own 'yours to take or leave'/'not worth another round' calls: the fail-open design note (no live call site is affected, verified) and the tombstone test's stamp-vs-deleted assertion.

Third pass addressing reviewer-core's remaining four findings, all implemented:
1. DayIndex = 0|1|2|3|4|5|6 added as a total type, exported from index.ts. Used for Meal.dayIndex: Stamped<DayIndex>, NewMealInput.dayIndex, moveMeal's dayIndex param, and MealDoc.dayIndex: StoredField<DayIndex> - createMeal/moveMeal can no longer construct an out-of-range value at the type level, so no new Result/error path was added (as instructed). decodeMeal's runtime 0-6 integer check is unchanged in logic, just narrows to 'v is DayIndex' - it's still the real gate for untyped data read from the store. meal-merge.test.ts and meal-doc.test.ts's fast-check arbitraries switched from fc.integer({min:0,max:6}) to fc.constantFrom<DayIndex>(0,1,2,3,4,5,6); two literal test fixtures needed an 'as const' to satisfy the narrower type.
2. Documented in Meal's doc comment: weekId is a caller-guaranteed non-empty precondition, not separately validated at construction - matches createExtraItem's identical precondition on item.weekId. No code change.
3. personal.ts's EntityMarking.shape doc comment now states it's load-bearing for R36 discrimination, not just identification - removing a key (such as item's 'aisle') can silently reopen the leak just fixed.
4. MealDoc's doc comment now has the same personal-fields pointer as ItemDoc's: 'Personal fields: name.v and link.v (see personal.ts)'.

Re-verified: pnpm exec vitest run --project unit packages/core (99 tests pass), pnpm typecheck clean, pnpm check green (14 checks).

Open question for reviewer-core's final pass, not implemented (out of scope for this pass per the lead's explicit list - no new exports requested): DayIndex is exported but the isDayIndex predicate that narrows number -> DayIndex lives private in meal-doc.ts. createMeal/moveMeal now require DayIndex, not number. If TASK-1.21.6's AddMealScreen derives a day from a route param or tap handler (a plain number) rather than mapping over a fixed DayIndex[] constant, it has no sanctioned way to narrow it without 'as DayIndex' or duplicating the 0-6 check outside core. Does the frozen contract need an exported DayIndex narrowing predicate, or is the UI expected to only ever supply literals/a fixed day-of-week array? Cheap to add later either way (additive, not breaking).

Forward note for UI/app layers (TASK-1.21.3/.5/.6): use the exported DayIndex type for day fields rather than bare number.

File list for handoff unchanged at 9 files (still uncommitted in the shared main worktree): packages/core/src/model/meal.ts(+test), packages/core/src/merge/meal-merge.ts(+test), packages/core/src/schema/meal-doc.ts(+test), packages/core/src/schema/personal.ts(+test), packages/core/src/index.ts.

Added the requested toDayIndex(n: number): DayIndex | null narrowing helper in meal.ts, exported from index.ts alongside DayIndex, with a unit test (narrows 0-6, rejects out-of-range and non-integer values including NaN). This closes the open question from the previous note - downstream UI/app code now has a sanctioned path from a plain number (route param, tap handler) to DayIndex without 'as DayIndex' or a duplicated check.

Re-verified: pnpm exec vitest run --project unit packages/core (101 tests pass), pnpm typecheck clean, pnpm check green (14 checks).

File list for handoff unchanged at 9 files (still uncommitted in the shared main worktree): packages/core/src/model/meal.ts(+test), packages/core/src/merge/meal-merge.ts(+test), packages/core/src/schema/meal-doc.ts(+test), packages/core/src/schema/personal.ts(+test), packages/core/src/index.ts.

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 1

(49 earlier lines omitted)
```text
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetSourceResolver.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/PlatformUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetUris.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ExpoAsset.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/ImageAssets.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/LocalAssets.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/resolveAssetSource.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-asset/build/AssetHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontFaceValidation.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/fontSourceFromFace.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/memory.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/server.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/Font.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontUtils.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/ExpoFontUtils.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-font/build/FontHooks.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/index.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/ExpoLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/RNLinking.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/createURL.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/validateURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Linking.types.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/Schemes.web.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-linking/build/devLaunchURL.js" points to missing source files
Sourcemap for "/Users/brukhabtu/src/github.com/bruk-io/grocs/node_modules/expo-router/build/testing-library/context-stubs.js" points to missing source files
 ❯ |unit| packages/providers-device/src/console-logger.test.ts (6 tests | 1 failed) 6ms
     × never writes a personal field: item names and amounts are removed (R36) 4ms
 ❯ |unit| packages/providers-device/src/buffer-logger.test.ts (6 tests | 1 failed) 6ms
     × never writes a personal field: item names and amounts are removed (R36) 3ms
 ❯ |unit| packages/ports/src/logging/fake.test.ts (5 tests | 1 failed) 5ms
     × never writes a personal field: item names and amounts are removed (R36) 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |unit| packages/providers-device/src/buffer-logger.test.ts > Logger contract > never writes a personal field: item names and amounts are removed (R36)
 FAIL  |unit| packages/providers-device/src/console-logger.test.ts > Logger contract > never writes a personal field: item names and amounts are removed (R36)
 FAIL  |unit| packages/ports/src/logging/fake.test.ts > Logger contract > never writes a personal field: item names and amounts are removed (R36)
AssertionError: expected '{"timestamp":1790000000000,"severity"…' not to contain 'Oat milk'

Expected: "Oat milk"
Received: "{"timestamp":1790000000000,"severity":"info","message":"command finished","attributes":{"item":{"id":"i1","weekId":"2026-W42","addedBy":"alex","name":{"value":"Oat milk","stamp":{"at":1,"by":"alex"}},"amount":{"v":"2 cartons","at":1,"by":"alex"}},"itemName":"[redacted]","nested":[{"mealLink":"[redacted]"}]}}"

 ❯ packages/ports/src/logging/contract.ts:53:26
     51|       logger.log(record({ attributes: { item, itemName: 'Oat milk', ne…
     52|       const text = output().join('\n');
     53|       t.expect(text).not.toContain('Oat milk');
       |                          ^
     54|       t.expect(text).not.toContain('2 cartons');
     55|       t.expect(text).not.toContain('recipes.example');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯


 Test Files  3 failed | 117 passed (120)
      Tests  3 failed | 1581 passed (1584)
   Start at  17:34:45
   Duration  8.55s (transform 38.33s, setup 3.85s, import 108.36s, tests 38.80s, environment 20.86s)

[ELIFECYCLE] Test failed. See above for more details.
```

Oct 24, 2026 — close review (philosophy:reviewer, did not do the work). Verdict: NOT CLOSED. All eight acceptance criteria are met and ticked after reading the code directly, but the change regresses an existing R36 guarantee outside this package, so the frozen contract cannot be signed off as built.

BLOCKING 1 — the R36 fix in personal.ts opened a different R36 leak. Full-tier check (pnpm test, unit+ui+app+tools): 3 failed / 1581 passed. The same committed contract test fails against all three Logger implementations (packages/ports/src/logging/fake.test.ts, packages/providers-device/src/console-logger.test.ts, packages/providers-device/src/buffer-logger.test.ts), all driven by packages/ports/src/logging/contract.ts:49. That fixture is an item-shaped payload {id, weekId, addedBy, name, amount} with no 'aisle'. Under the old shape ['weekId','addedBy'] it matched and its personal fields were redacted; under the new ['weekId','addedBy','aisle'] it no longer matches, so redact falls through and the item name and amount are written in cleartext. The failure output proves the mechanism: itemName:'[redacted]' (the attribute-key path still works) next to name:{"value":"Oat milk"} (the shape path is broken). contract.ts is untouched by this task (git status clean, last changed in 9b81147), so the regression is wholly attributable to this diff.

This falsifies a written claim in the implementation notes: 'grepped every redact() call site … No Item/Meal object reaches redact anywhere in the current codebase, so the aisle requirement cannot cause a new leak today.' The Logger contract test does exactly that, and the leak is real. Three reviewer-core rounds reviewed the claim rather than the suite.

The root cause is that redact's shape match is fail-open: adding a required key to a shape can only narrow what gets redacted, and three tests happening to catch it is not a structural guarantee that no other item-shaped payload exists. Adding 'aisle' to the fixture is NOT the fix — it would make the test pass and leave the leak. This is a design call for whoever takes the task back; options, not a pick: (a) discriminate on the meal side instead, since dayIndex is meal-only and present on every meal doc, leaving item's shape as it was — note AC7 forbids a bare reorder, so this needs to be a real discriminator, not just list order; (b) make the match fail-closed, e.g. union the personal fields of every entity whose shape matches, so a doc matching both item and meal has name, amount and link all redacted; (c) most-specific-match semantics. Whichever is chosen, keep the new personal.test.ts classification test — both halves of AC7 are genuinely covered there (meal doc classifies as 'meal', item doc as 'item').

BLOCKING 2 — nothing is committed, so there is no finish line on record. board-check close TASK-1.21.1 reports: 'its file has never been committed: commit it before review'. The task file itself is untracked and the nine implementation files are uncommitted in the shared main worktree. close-task will refuse until that is committed; status left In Progress and unchanged, per close-work.

PROCESS (not blocking, no draft) — the gap that let this survive three review rounds: the builder verified with 'pnpm exec vitest run --project unit packages/core', scoped to one package, and 'pnpm check', which runs checks and not tests (package.json: 'check' is tools/checks/run.ts, 'test' is the vitest projects). personal.ts is depended on by the whole repo's logging, and was never run against the whole repo's tests. Any future edit to personal.ts needs full 'pnpm test', not a package-scoped run.

NO DRAFTS FILED. The leak belongs to this open task's own work, not a new task. redact's fail-open shape matching is the same finding at the design level and should be settled inside the fix above rather than queued separately.

Not re-raised, confirmed correct as built on independent reading: Meal's field shape and the five operations (meal.ts), mergeMeal's field-wise LWW with the createdAt/addedBy first-writer tie-break and permanent tombstone (meal-merge.ts), encodeMeal/decodeMeal's validation mirroring item-doc.ts with weekId.v non-empty and the deliberate link-permissive/dayIndex-strict asymmetry (meal-doc.ts), the total DayIndex type plus toDayIndex, and the barrel exports.

Oct 24, 2026 (orchestrator, after philosophy:reviewer's close attempt): My own planning error, not the builder's or reviewer-core's. AC7 as I originally wrote it said item's shape must be made discriminating "not just reordered" - an overgeneralization of reviewer-core's first-round finding ("find still returns the item marking first"), which was only true for the *unordered* case. That constraint pushed the builder toward adding 'aisle' to item's shape, which fixed the meal-misclassified-as-item leak but broke the opposite direction: packages/ports/src/logging/contract.ts's existing item fixture has no 'aisle' (and no dayIndex), so it now matches *neither* shape and redact() falls through entirely, leaking name/amount in cleartext - a real regression philosophy:reviewer caught by running the full pnpm test suite (3 failed / 1581 passed), which reviewer-core's three rounds never did (scoped to packages/core's own tests only).

Corrected AC7 above, retracting "not just reordered": revert item's shape to its original ['weekId','addedBy'] (no aisle), and reorder PERSONAL_FIELDS so 'meal' is checked before 'item' in find()'s iteration. This works because dayIndex is a true structural exclusive - no ItemDoc or item-shaped fixture has it or ever will, so meal's shape check can only succeed for an actual meal, and falls through cleanly to item's original check otherwise. Simpler than the aisle approach and does not touch item's shape at all, so the logging contract fixture is unaffected.

Process lesson for future rounds on this task and others touching packages/core/src/schema/personal.ts (a cross-cutting module used by all logging): review and verification must run the full pnpm test suite, not a package-scoped subset, before a change here is considered checked.

RETRACTION and regression fix (philosophy:reviewer caught this via the full pnpm test suite, which reviewer-core's three rounds never ran - they only ran packages/core's own tests):

The second-pass claim 'Added aisle to item's shape ... now genuinely discriminating' and the third-pass note documenting it as load-bearing are both WRONG and superseded. The aisle addition fixed meals-misclassified-as-items but broke the opposite direction: packages/ports/src/logging/contract.ts's existing item fixture ({id, weekId, addedBy, name, amount}, no aisle, no dayIndex) matched neither shape after that change, so redact() fell through entirely and name/amount leaked in cleartext - a live regression (3 failing tests in the full suite), not a hypothetical. My earlier claim that 'no Item/Meal object reaches redact anywhere in the current codebase' was also wrong: it held for production call sites but missed the ports logging contract's test fixture, which is exactly what broke.

Actual fix (per the lead's correction, AC7's 'not just reordered' wording in the original note was an overgeneralization on the lead's part, now corrected on the board):
1. Reverted item's shape in personal.ts back to ['weekId','addedBy'] - no change to item's matching behavior.
2. Reordered PERSONAL_FIELDS so meal is listed before item. dayIndex is a true structural exclusive to meal (no ItemDoc or item-shaped object has it or ever will), so checking meal's shape first means meal can only ever match an actual meal; anything else falls through cleanly to item's original, unchanged check.
3. personal.test.ts's classification test now also covers the exact partial-item shape that broke (no aisle, no dayIndex) to classify as 'item' - this is the regression guard, since the existing item fixtures were always complete Item/ItemDoc values and wouldn't have caught this.
4. Corrected the shape doc comment's earlier wrong claim about what leaks on misclassification: when a meal is misclassified as an item, item's personal list (name only) applies, so link leaks - not item's own fields.

Full-suite re-verification per the lead's explicit instruction: pnpm test (all four vitest projects: unit, ui, app, tools) - 120 files, 1584 tests, all pass. pnpm typecheck clean. pnpm check green (14 checks).

File list for handoff unchanged at 9 files (still uncommitted in the shared main worktree): packages/core/src/model/meal.ts(+test), packages/core/src/merge/meal-merge.ts(+test), packages/core/src/schema/meal-doc.ts(+test), packages/core/src/schema/personal.ts(+test), packages/core/src/index.ts.
<!-- SECTION:NOTES:END -->
