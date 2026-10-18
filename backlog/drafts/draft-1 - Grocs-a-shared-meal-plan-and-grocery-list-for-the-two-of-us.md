---
id: DRAFT-1
title: 'Grocs: a shared meal plan and grocery list for the two of us'
status: Draft
assignee:
  - '@bruk'
created_date: '2026-10-18 16:53'
updated_date: '2026-10-18 16:54'
labels:
  - size-8
  - product
dependencies: []
type: intent
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

We use Google Keep for groceries and it's janky. Each week we plan meals on specific days, each with a recipe link or none (like pantry pasta), then put a grocery list together from them and cross things off while shopping. We need to update it live, both of us, from our own phones. Meal and recipe features should stay minimal: a meal is just a name and an optional link. The app should feel cute and alive, with the mushroom mascots living in the kitchen.

The two apps must not drift apart. The rules live once, in a pure TypeScript SDK, and every kind of I/O (network, storage, config, logging, telemetry) goes through interfaces the SDK defines, which each platform provides. UI components are shared too. Telemetry should be ready for Datadog later without touching the rules.

## Affected users and systems

- Bruk (Google Pixel 10 Fold, Android) and Shazya (recent iPhone, iOS).
- Our Google accounts, used to sign in (Google sign-in only).
- The canvas designs in the Grocs project (screens and atomic design system).

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
- [ ] #13 Network, storage, config, logging and telemetry are reached only through interfaces the SDK defines; each app supplies providers for them.
- [ ] #14 Both apps use the same UI component library, named after the atomic design system.
- [ ] #15 Telemetry can be sent to Datadog later by adding a provider, with no change to the SDK's domain code.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sized 8: the whole first version, with real unknowns in the combine-ingredient flow, the fold layout and two-phone conflict handling. At 8 it gets a spec first, and the split follows the spec.
<!-- SECTION:NOTES:END -->
