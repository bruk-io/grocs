---
id: TASK-84
title: >-
  Grocery items from an imported recipe keep broken parentheses and prices in
  their names
status: To Do
assignee: []
created_date: '2026-11-08 04:21'
labels:
  - size-2
dependencies: []
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Seen in TASK-74.5.16's proof with Budget Bytes' basic chili. Ingredient lines such as '1 yellow onion (small dice, (about 2 cups) $0.74)' become the grocery item 'yellow onion (small dice', and '2 Tbsp olive oil ($0.35)' becomes 'olive oil ($0.35)'. The recipe view shows the lines as written, which is right; the grocery names are what read badly. The item name comes from the server's ingredient-line parser (providers-server recipe/pure) and core groceryLineFor (decision-16).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An ingredient line whose note sits in parentheses yields an item name with no unbalanced parenthesis, shown by golden rows for the Budget Bytes lines above
- [ ] #2 A trailing price note in parentheses is not part of the item name
<!-- AC:END -->
