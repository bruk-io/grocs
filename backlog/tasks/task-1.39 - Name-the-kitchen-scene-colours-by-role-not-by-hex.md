---
id: TASK-1.39
title: 'Name the kitchen scene colours by role, not by hex'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 03:53'
updated_date: '2026-10-19 11:28'
labels:
  - size-2
  - design-system
milestone: m-2
dependencies: []
modified_files:
  - packages/ui/src/tokens/tokens.json
  - packages/ui/src/tokens/tokens.ts
  - packages/ui/src/organisms/kitchen/art/Kitchen.tsx
  - packages/ui/src/organisms/kitchen/art/KitchenDoor.tsx
  - tools/svg/render.ts
  - tools/checks/svg-art.ts
  - tools/checks/design-system-checks.test.ts
parent_task_id: TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filed from the review of TASK-1.19. The kitchen-scene colours are in tokens.json as color.scene.h<hex> (for example color.scene.h5e9952), against decision-10's role-based token naming. A hex-named token says nothing about what it paints, so a palette change means renaming every token and every generated reference, and the art cannot be retinted by role. Evidence: packages/ui/src/tokens/tokens.json color.scene; tools/build-svg.ts maps hex to these names.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every color.scene token is named for what it paints (for example cabinet, wall, foliage), per decision-10
- [ ] #2 pnpm svg regenerates the scene from the renamed tokens with no hand edits, and pnpm check passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Map each of the 53 color.scene tokens to a camelCase role name from where the hex is painted in design/svg/scenes/kitchen.svg and kitchen-door.svg (ceiling, wall, cabinet, steel, foliageDark, tableTop...), matching the existing role naming (surfaceCanvas, mealAmber, cremiCap). A hex keeps one token, so a hex shared by several things is named for its main use.
2. Rewrite the color.scene group of packages/ui/src/tokens/tokens.json with a script (values untouched, grouped by area), then run pnpm tokens for tokens.ts.
3. Run pnpm svg so Kitchen.tsx and KitchenDoor.tsx are regenerated from the renamed tokens, no hand edits.
4. Add a guard in tools/svg/render.ts (new rule svg-art/token-name, registered in tools/checks/svg-art.ts) that fails a color.scene or color.mascot key shaped like h<6 hex digits, so the names cannot drift back. Update the fixture in tools/checks/design-system-checks.test.ts (scene h112233) to a role name and add a test for the new rule. Mention the naming in design/svg/README.md.
5. Run pnpm svg, check, typecheck, test and the ui visual suite.
### Risks
- A rename that swaps two hexes, or a typo, changes a colour. The generated JSX differs from before only in token names, so I diff old and new token to hex pairs for every reference in the generated files, and the visual baselines must stay byte-identical.
- Visual baselines changing means something else moved; I would find the cause rather than run visual:update.
- Two names for one role or a name that lies about a shared hex (white, used by window frame, steam, bubbles). Mitigation: name for the main use and say so in the notes.
### Proof
- pnpm svg writes only the two art files; git diff of them shows only tokens.color.scene.<name> changes, and a script resolves old and new references to identical hex values.
- pnpm check, pnpm typecheck, pnpm test pass; pnpm --filter @grocs/ui visual passes with no change under packages/ui/visual-baselines.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Accepted Oct 19, 2026. Touches tools/build-svg.ts as well as packages/ui tokens, so it goes to a builder working across tools and ui rather than the ui-only builder.

builder-ui report.

- Renamed all 53 color.scene tokens in tokens.json from h<hex> to role names (ceiling, wall, floor, cabinet, cabinetGrain, steel, steelHandle, ovenGlass, potRim, wateringCan, sky, foliageDark, lawn, tableTop, fanBlade, lamp, lightBeam and so on), grouped by area. Values untouched. pnpm tokens regenerated tokens.ts; pnpm svg regenerated Kitchen.tsx and KitchenDoor.tsx with no hand edits (it writes only those two art files).
- Equivalence: a script rewrote the old generated files' token names through the old-to-new map and compared with the regenerated files: identical apart from the names, and every name resolves to the same hex as before (128 references).
- A hex has one token, so a hex used for several things is named for its main use: windowFrame is also the steam, soap bubbles, fan hub and note paper; steelHandle is also the fan pole; ceilingTrim is also the lamp-shade outline; hardware is the dark metal of handles, faucet and cooktop. Splitting these needs separate hexes in the SVG, which would change pixels.
- Added a guard so the names cannot drift back: tools/svg/render.ts fails a color.mascot or color.scene key shaped like h<6 hex digits (new rule svg-art/token-name, registered in tools/checks/svg-art.ts with req, why and fix; test added in tools/checks/design-system-checks.test.ts, whose scene fixture h112233 is now wall).
- Not done: design/svg/README.md should say tokens are named for what they paint. It is outside ui and tools, so I did not edit it. Suggested sentence: Name a token for what it paints, never for its hex; the converter fails a key shaped like h5e9952 (svg-art/token-name).
- Proof: pnpm svg, pnpm check (13 checks), pnpm typecheck, pnpm test (88 files, 1157 tests) and pnpm --filter @grocs/ui visual (304 images compared) all pass; nothing changed under packages/ui/visual-baselines. The visual run on the unchanged branch before the work also passed.
<!-- SECTION:NOTES:END -->
