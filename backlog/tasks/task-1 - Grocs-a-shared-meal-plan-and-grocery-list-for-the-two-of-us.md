---
id: TASK-1
title: 'Grocs: a shared meal plan and grocery list for the two of us'
status: To Do
assignee:
  - '@bruk'
created_date: '2026-10-18 16:53'
updated_date: '2026-10-19 15:53'
labels:
  - size-8
  - product
  - finish-moved
dependencies: []
documentation:
  - >-
    backlog/docs/specs/doc-1 -
    Spec-Grocs-a-shared-meal-plan-and-grocery-list-for-the-two-of-us.md
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

We use Google Keep for groceries and it's janky. Each week we plan meals on specific days, each with a recipe link or none (like pantry pasta), then put a grocery list together from them and cross things off while shopping. We need to update it live, both of us, from our own phones. Meal and recipe features should stay minimal: a meal is just a name and an optional link. The app should feel cute and alive, with the mushroom mascots living in the kitchen.

The two apps must not drift apart. The rules live once, in a pure TypeScript SDK, and every kind of I/O (network, storage, config, logging, telemetry) goes through interfaces the SDK defines, which each platform provides. UI components are shared too. Telemetry should be ready for Datadog later without touching the rules.

The backend is Firebase. We need to be able to test our code quickly, on our own machines, without touching the real data. Anything a script can check, such as the import layers, is enforced by hooks and CI rather than written down as a rule for someone to remember; written rules are small and cover only what a script can't check.

## Affected users and systems

- Bruk (Google Pixel 10 Fold, Android) and Shazya (recent iPhone, iOS).
- Our Google accounts, used to sign in (Google sign-in only).
- Firebase: Firestore for our data, Firebase Auth for sign-in, Cloud Functions for push notifications.
- Storybook, where we design, browse and review the design system. The old canvas designs are retired and kept in the repo only as a reference until built.

## Open questions

- [ ] Carried forward: what is the playful inline flow for combining a shared ingredient on the duplicated item? It doesn't exist in the designs yet. It shapes one interaction, not the scope, so it becomes a design task under the spec.
- [ ] Carried forward: how should the layout use the Pixel 10 Fold's inner screen, a stretched phone layout or plan and list side by side? It changes layout, not what the app does, so it becomes a design task under the spec.
- [ ] Carried forward: recipe-link ingredient extraction. Parked so it doesn't block the first version.
- [ ] Carried forward: moving a dropped meal to the next week. Parked; a dropped meal stays where it is.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Both of us sign in with Google and share one kitchen through an invite.
- [ ] #2 We can plan a week with a meal on any day: a name and an optional link, nothing more.
- [ ] #3 The week's grocery list holds items for meals plus extras, and each item shows a badge for the meal or meals it's for.
- [ ] #4 When two meals need the same ingredient, the duplicated item asks inline, without a dialog, whether to combine them into one line.
- [ ] #5 Either of us can tick items off while shopping, and the other sees it within a few seconds.
- [ ] #6 Either of us can opt in to a notification when the other adds something; it is off until we turn it on.
- [ ] #7 It runs on the Pixel 10 Fold (outer and inner screens) and on Shazya's iPhone.
- [ ] #8 We do a month of weekly shops in Grocs instead of Keep.
- [ ] #9 Must not break: a tick made offline in the store is never lost and reaches the other phone once back online.
- [ ] #10 Must not break: editing or ticking the same item at the same time never creates a duplicate or silently undoes the other person's tick.
- [ ] #11 Must not break: something deleted never comes back.
- [ ] #12 The domain rules live once, in a pure TypeScript SDK that both apps use, with no I/O inside it.
- [ ] #13 Both apps use the same UI component library, named after the atomic design system.
- [ ] #14 Network, storage, config and logging are reached only through interfaces the SDK defines; each app supplies providers for them.
- [ ] #15 Logging is instrumented automatically at the interfaces and commands, never by hand in features, and logs can go to a hosted service such as Datadog later by adding a provider.
- [ ] #16 The layers' import rules are enforced automatically by hooks and CI, so the domain can never depend on I/O, platform or UI code.
- [ ] #17 Anything a script can check is enforced by hooks, pre-commit and CI. Written rules are small, one per file, and hold only what no script can check.
- [ ] #18 Every test runs on our own machines, using the Firebase emulators wherever a backend is needed, with no access to production data and no Docker.
- [ ] #19 We can browse the design system in a browser and on our phones, built from the same components the app uses.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 8: the whole first version, with real unknowns in the combine-ingredient flow, the fold layout and two-phone conflict handling. At 8 it gets a spec first, and the split follows the spec.

Finish moved on 2026-10-18, before any children started: Bruk paused telemetry, asked for automatic logging instrumentation, and asked for import-layer enforcement to be part of the spec. Criteria 13 and 15 were rewritten for logging, and one criterion was added for import-layer enforcement.

Finish moved again on 2026-10-18, before any children started: Bruk chose Firebase as the backend (decision-1), asked for quick local testing, and asked that anything a script can check be enforced by hooks rather than written rules. Criterion 16 was reworded to name hooks, and criteria 17 and 18 were added. The problem and affected systems now name Firebase.

Finish moved on 2026-10-18, before any children started: Bruk chose Storybook for viewing the design system in a browser and on device (decision-2), and asked for the canvas to move into the repo. Criterion 19 was added and the affected systems updated.

Spec approved by @bruk

Finish moved on 2026-10-18: Bruk retired the canvas in favour of Storybook. Spec R59 and R66, its layout and its canvas section changed; the affected systems now name Storybook. TASK-1.19 was rescoped and TASK-1.6 and TASK-1.7 lost their canvas criterion. Bruk also accepted every slice and follow-up draft (now TASK-1.18 to TASK-1.35) and answered that push notifications may name the item.

Spec changed after approval (Oct 19, 2026): doc-1's repository layout gains packages/providers-memory, the in-memory provider for the demo build (decision-12, TASK-10.7). No requirement changed.
<!-- SECTION:NOTES:END -->
