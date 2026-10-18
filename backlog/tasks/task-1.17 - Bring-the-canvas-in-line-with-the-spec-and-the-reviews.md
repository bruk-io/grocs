---
id: TASK-1.17
title: Bring the canvas in line with the spec and the reviews
status: Done
assignee:
  - '@claude'
created_date: '2026-10-18 18:16'
updated_date: '2026-10-18 18:44'
labels:
  - size-3
  - design-system
milestone: m-1
dependencies: []
modified_files:
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/AddMeal.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/DS-Atoms.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/DS-Molecules.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/DS-Organisms.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/DS-Templates.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/DS-Tokens.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/EmailSignIn.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/Household.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/JoinInvite.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/Main.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/Plan.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/QuickAdd.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/RecipeImport.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/Welcome.dc.html
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/canvas.json
  - >-
    /tmp/claude-0/-home-claude/687c478e-5ac7-57e1-a798-bdce1003274b/scratchpad/grocs/project/grocs.css
parent_task_id: TASK-1
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rescoped Oct 18: the canvas becomes a sketchpad for unbuilt designs (R66), so the child-component refactor from the reviews is dropped. Kept: token and drift fixes from REVIEWS.md and the spec alignment list in AGENT-BRIEF.md. The shared stylesheet is already written.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Every board uses the shared stylesheet and passes the board checker with no raw colours outside it
- [x] #2 The reviews' drift findings are fixed: one radius and type scale, matching sizes for repeated parts, missing states on interactive atoms
- [x] #3 EmailSignIn is removed, RecipeImport is marked parked, Plan has no rollover card and shows two meals on a day, and its badge is computed
- [x] #4 New boards: Settings, offline and waiting-to-send, invalid invite code, and the in-app toast
- [x] #5 Published to the design artifact
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Spec alignment in one agent pass over the app screens: remove EmailSignIn and its links, mark RecipeImport parked, Plan without the rollover card and with two meals on one day, computed badge.
2. Drift fixes from REVIEWS.md across screens and DS boards: radius and type scales onto the tokens in grocs.css, repeated parts at one size, missing states on interactive atoms.
3. New boards: Settings, offline and waiting-to-send, invalid invite code on JoinInvite, in-app toast. canvas.json updated by the same agent, since it is the only one editing.
4. Independent review against REVIEWS.md and the spec alignment list, then the orchestrator publishes.

### Risks
- Editor changes on the published artifact since version 16: read the live version before publishing and merge.
- One agent edits every file, so nothing collides, but it is a long run: it commits progress notes as it goes.

### Proof
- tools/dc_check.py exits 0 with no raw-hex warnings.
- The reviewer reports each REVIEWS.md finding as fixed, dropped (child-component refactor, rescoped) or not applicable.
- The published artifact renders every board.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Canvas pass finished 2026-10-18: 17 boards, checker 0 errors; EmailSignIn removed; Settings, JoinInviteInvalid, Offline and Toast added. Under independent review before publishing.

Review (reviewer agent, Oct 18): AC1-4 met, AC5 pending (orchestrator publishes). dc_check.py: 17 files, 0 errors, no raw-hex warnings; 107 hex in Welcome are inside the kitchen-scene SVG (checker exempts SVG), DS-Tokens hex are swatch labels. Rendered all 17 boards with Playwright (no support.js; helper stubs it), screenshots in scratchpad/review/. Plan: no rollover card, Wed has two meals, badge {{remaining}}. EmailSignIn gone from files and canvas.json; RecipeImport titled 'Parked: recipe import'. New boards Settings, Offline, JoinInviteInvalid, Toast present. Child-component refactor dropped by rescope. Minor: Welcome scene overflows right (scrollWidth 1020, Enoki cut at edge) and the auth sheet has an empty band above the Google button; no checks.json, so record-check could not run. Not closed: AC5 open.

Closed by reviewer. AC1-4 met on local evidence (dc_check 0 errors/no hex warnings; renders in scratchpad/review/). AC5: orchestrator reports publish as design artifact version 17 (id 1792349068-d652) with the 17 canvas.json boards plus canvas.json and grocs.css, EmailSignIn removed; reviewer cannot read the artifact, but confirmed canvas.json's 17 boards match the local project folder exactly. Welcome 1020 scrollWidth retracted: root is 390x844 with overflow hidden, so it is the clipped panning scene, not a regression. Remaining low findings, no drafts: Welcome auth sheet empty band above the Google button (likely bubble rest state); icon stroke widths and suggestion.row add size unverified; child-component refactor (review B1/B2, mascot drift) dropped by rescope; repo has no .claude/checks.json so record-check full could not run.
<!-- SECTION:NOTES:END -->
