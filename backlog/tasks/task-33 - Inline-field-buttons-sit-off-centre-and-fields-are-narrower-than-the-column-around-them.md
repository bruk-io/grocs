---
id: TASK-33
title: >-
  Inline field buttons sit off centre, and fields are narrower than the column
  around them
status: To Do
assignee: []
created_date: '2026-10-20 22:33'
labels:
  - size-2
  - layer-ui
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem
Found by Bruk on the demo APK on his Fold (2026-10-20), screenshots in the conversation. In the screenshots (1080 px wide):
- The '+' in Add an item and 'Paste' in the recipe link field sit about 3 px from the field's top and 22 px from its bottom.
- Text fields' visible edges sit about 8 px inside the edges of the list rows, the tab bar and the bottom action button in the same column.

## Affected users and systems
TextField, AddBar, LabelledField; Groceries, Add a meal and every form.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The inline buttons in AddBar and the recipe link field are centred vertically in their field, with equal inset on top, right and bottom
- [ ] #2 A text field's visible edge lines up with the rows, cards and action buttons in the same column on Groceries and Add a meal
- [ ] #3 The visual baselines show both, and the focus ring still shows
<!-- AC:END -->
