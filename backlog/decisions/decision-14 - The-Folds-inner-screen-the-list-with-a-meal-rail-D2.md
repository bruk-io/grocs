---
id: decision-14
title: 'The Fold''s inner screen: the list with a meal rail (D2)'
date: '2026-10-21 15:37'
status: accepted
---
## Context

R43: the app runs on a Pixel 10 Fold, on both the outer screen (412 x 901 dp) and the inner screen (791 x 820 dp), and keeps its state when the phone folds or unfolds. Design question D2 (TASK-1.7) asked how the layout uses the inner screen. The designer drew three options, kept as boards in design/reference/ (D2-OptionA, B and C):

- A, a stretched list: the phone layout, wider.
- B, plan and list side by side: this week's meals on the left, Groceries on the right, both live.
- C, a list with a meal rail: a narrow left rail holds the navigation and this week's meals as filters, and Groceries fills the rest.

The designer's pick was B.

## Decision

Option C, the list with a meal rail. On the inner screen:
- A left rail replaces the floating tab bar. It holds the navigation (Meal plan; Groceries with its remaining count), then "This week's meals": All items, each meal with its day and item count, and Plan a meal.
- Groceries fills the rest of the screen.
- Choosing a meal in the rail filters the list to that meal's items, with a line saying so ("Only Chana masala · 4 to buy") and Show all. A meal with nothing left shows "Nothing on the list for Chana masala yet."

Decided by Bruk on Oct 21, 2026, from the three boards, over the designer's pick of B.

## Consequences

- The inner layout applies by window width, not by device: at 600 dp and wider, which is where Android's large-screen guidance starts the medium width class. Below that, the phone layout. Chosen by the orchestrator when recording the decision. It means a tablet, or a split window, gets the layout its width fits.
- R43's state across postures includes the rail's filter: folding to the outer screen keeps the chosen meal, and the phone layout shows the same filter line with Show all.
- Filtering needs each item's meal badges (Item.badges, already in core) and the week's meals. Real meals arrive with the meal plan slice (TASK-1.21). Until then the rail shows the sample week, and the demo filters its sample list.
- The boards draw Groceries only. Meal plan on the inner screen keeps the rail, with the plan in the content area at the phone layout's width, until a design says otherwise.
- TASK-1.31 builds it: a rail organism and the inner variant of the main layout in packages/ui, then the app's width switch and filter state. The visual baselines already shoot a 791 x 820 fold-inner view, and a device check on the Fold confirms the posture change.
