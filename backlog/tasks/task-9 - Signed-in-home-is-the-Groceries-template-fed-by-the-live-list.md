---
id: TASK-9
title: Signed-in home is the Groceries template fed by the live list
status: In Progress
assignee:
  - '@builder-app'
created_date: '2026-10-19 09:27'
updated_date: '2026-10-19 11:07'
labels:
  - size-3
  - layer-app
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After TASK-1.37.5 the signed-in / route still renders the skeleton's ListScreen, and /groceries shows GroceryListTemplate with sample data only, so Groceries, Plan and Settings are not reachable from the signed-in app. The template needs sections, meal badges and who-added that the skeleton's Item model lacks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Signed in, / leads to Groceries rendering GroceryListTemplate from live items, with the tabs reaching Plan and Settings
- [ ] #2 The skeleton's add-item flow and two-client test pass through the Groceries template
- [ ] #3 The /groceries sample route and its state query parameters move to stories or a dev-only route
- [ ] #4 Route tests show the mushroom host on every screen (R40) and cover the Groceries all-done state
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. GroceriesScreen becomes live (app, kitchenId): one 'This week' section of to-buy items plus cartItems, add bar dispatches AddItem. 2. Sample screen moves to SampleGroceriesScreen on a dev-only route /groceries-samples (null unless dev). 3. Signed-in / renders live GroceriesScreen; delete ListScreen and groceries route; go.groceries goes to /. 4. Tests: move ListScreen tests, update route tests, add mushroom-on-every-screen and all-done. 5. Run check, typecheck, test, check:release, test:emulator.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted by @bruk (Oct 19, 2026). Criterion 4 added at acceptance: the TASK-1.37.5 reviewer folded the mushroom-host and all-done route tests into this follow-up, but the draft did not list them. Scope: app layer only. Live items render without sections, meal badges or anything else the Item model does not hold yet; those fields arrive with the slices that own them (TASK-1.20 onwards), and this task does not add them to core.

Builder report (app layer only). Signed-in / now renders the live GroceriesScreen (GroceryListTemplate fed by watchWeekItems): to-buy items in one 'This week' section, in-cart items in the cart, enoki mascot when all done, no meal badges/who-added/sections (Item lacks them). Add bar dispatches AddItem; empty name shows a banner 'Type what to buy first'. Tabs reach Plan and Settings; every screen's Groceries link now goes to /. Skeleton ListScreen and its test removed; its two cases (add item, empty name) live in index.route.test.tsx and run through the template. The two-client test drives the app facade, not a screen, so it is unchanged and passes. /groceries is gone; the sample states moved to dev-only /groceries-samples?state= (SampleGroceriesScreen; renders nothing unless useNativeApp().dev). Route tests: mushroom host on every route (R40), all-done (seeded in-cart item via new syncStore option on appOnFakes), live add flow, dev-only sample route, nothing in release. Checks: pnpm check, typecheck, test (1168), check:release, test:emulator (27) all exit 0. No story changed, so visual not run. Caveats: kitchenId is still dev?.kitchenId ?? '' (no kitchen slice yet); members is empty on the live screen; the screenshot match with the design is by proxy, not seen on a device.
<!-- SECTION:NOTES:END -->
