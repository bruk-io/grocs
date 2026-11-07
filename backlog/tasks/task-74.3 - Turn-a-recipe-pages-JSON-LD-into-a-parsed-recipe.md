---
id: TASK-74.3
title: Turn a recipe page's JSON-LD into a parsed recipe
status: To Do
assignee:
  - '@claude'
created_date: '2026-11-07 01:00'
updated_date: '2026-11-07 01:09'
labels:
  - size-3
  - providers
dependencies:
  - TASK-74.1
parent_task_id: TASK-74
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The parsing half of TASK-74, as server-only pure code the apps cannot import (where it lives is TASK-74.1). It has two steps: map the schema.org Recipe JSON-LD into one shape (finding the Recipe in the top level, an array or @graph, with @type possibly a list; instructions as a string, strings, HowToStep or nested HowToSection; yield as string, number or list; image as string, object or list; ISO 8601 durations; HTML entities), then split each ingredient line into quantity, unit and item, best effort, keeping the line as written. A 2026-11-06 probe found complete JSON-LD on six logged-out NYT Cooking pages, all marked isAccessibleForFree: false, so that flag says nothing about completeness.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Given a page's HTML, parsing returns a recipe with title, yield, steps and ingredients, or a typed error when the page has no Recipe JSON-LD or the recipe has no ingredients or no steps
- [ ] #2 Each ingredient keeps its line as written plus quantity, unit and item, which may be empty when the line has none; Unicode fractions, mixed numbers, ranges, bracketed sizes such as '1 (14-ounce) can', notes after a comma and lines with no quantity are covered by tests
- [ ] #3 Parsing also returns the raw Recipe JSON-LD object, and parsing that object again gives the same recipe
- [ ] #4 No site-specific code: saved pages from at least five sites, including NYT Cooking, are fixtures and all parse
- [ ] #5 The parsing is pure: no network, clock or I/O, and app code cannot import it
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
decision-16 (2026-11-07): ParsedRecipe also carries recipeId (the server's cache key for the normalised URL) and sourceUrl (the normalised URL), because kitchens store recipes under that id and meals find them by that URL.
<!-- SECTION:NOTES:END -->
