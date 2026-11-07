---
id: TASK-74.4.8
title: 'Manual local proof: the import function imports real recipes in the emulator'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-11-07 02:28'
updated_date: '2026-11-07 05:06'
labels:
  - size-1
  - orchestrator
dependencies:
  - TASK-74.4.7
  - TASK-74.4.2
parent_task_id: TASK-74.4
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-74.4 AC#7 and TASK-74 AC#13. A live fetch is allowed only in this manual run (decision-15). This is also the only run of the default node:http/https transport and the guarded lookup against real DNS. No deploy commands are used.

Split key: orch-proof-function. Layer: orchestrator. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implementation notes on TASK-74.4 record: pnpm emulators running; real URLs from three fixture sites (one of them NYT Cooking) imported through the callable, with titles and counts; a second call answered from the cache with no new fetch; a URL whose host resolves to 127.0.0.1 (http://localhost.:8080/x) refused as unreachable; and a log excerpt showing no URL or title
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Run `pnpm emulators` from the repo root in the background, and wait for ports 8080, 9099 and 5001.
2. Write a scratchpad script that signs in anonymously with firebase/emulator-client.ts createEmulatorClient and calls httpsCallable(functions, 'importRecipe') with each of three source URLs from the fixtures README, one of them NYT Cooking.
3. Record each result's ok, title, ingredient count and step count.
4. Call the first URL again and confirm from the functions emulator log that no fetch happened (a cache hit).
5. Call it with 'http://localhost.:8080/x' and confirm the result is {ok:false,error:'unreachable'}.
6. Grep the emulator log for the URLs and recipe titles and confirm there are no matches (R36).
7. Write the results into the TASK-74.4 notes with the backlog CLI, then stop the emulators.

### Risks
Follow TASK-74's slice contract exactly; a needed contract change goes in this task's notes and the work stops (decision-3 mediation).

### Proof
Each acceptance criterion is shown by a test or command output recorded in the notes.

Files expected to change:
- (none)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
First local proof run (orchestrator, 2026-11-07, pnpm emulators on main at 2f7292b, real callable via firebase/emulator-client.ts, script scratchpad/proof-import.ts):
- RecipeTin Eats https://www.recipetineats.com/easy-classic-chinese-beef-stir-fry/: ok, 'Easy Chinese Beef Stir Fry', 19 ingredients, 10 steps, image, 2489 ms.
- Same URL again with ?utm_campaign=x: ok, same recipeId, 11 ms; the emulator logged no outbound request for it (cache hit, and normalisation drops the utm tag).
- NYT Cooking https://cooking.nytimes.com/recipes/1015178-marcella-hazans-tomato-sauce: not-a-recipe. Cause: the live fetcher can't read gzip bodies, which NYT sends unasked - filed as a bug under TASK-74.4. The repeat call with ?utm_source=share returned not-a-recipe in 13 ms from failure memory with no outbound request.
- Serious Eats https://www.seriouseats.com/the-best-chili-recipe: blocked. The site answers 403 to curl with browser headers too, so blocked is the right answer.
- http://localhost.:8080/x: unreachable (SSRF guard). 'not a link': invalid-url.
- R36: the function's own log lines carry only the error kind ({error:'not-a-recipe'|'blocked'|'unreachable', message:'importRecipe failed'}). The only URLs in the emulator output are the Functions emulator's own 'External network resource requested!' warnings, which are emulator infrastructure and absent in production; they also show exactly four outbound requests (NYT, Serious Eats, RecipeTin and its trailing-slash redirect).
Not yet met: three fixture sites including NYT importing ok. Re-run after the gzip bug is fixed.
<!-- SECTION:NOTES:END -->
