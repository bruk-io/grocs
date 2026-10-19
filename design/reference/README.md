# Design reference (retired canvas)

Bruk retired the design canvas on Oct 18, 2026. Storybook is the only record of the design system (spec R66, decision-2).

These boards are kept read-only as the visual reference for building components and screens. Nothing new is designed here. Delete a board in the same change that builds what it shows; a check will fail when a name is both built and still here (R66).

- `*.dc.html`: the boards, in claude.ai's Design Component format. They render only in the design artifact, which is frozen at version 18 on claude.ai and is not published again. Its "Design options" page shows the D1 and D2 options (TASK-1.6, TASK-1.7).
- `canvas.json`: which page each board sits on (`app`, `options`). The design system boards are gone: every one is built in Storybook.
- `shots/`: a screenshot of each board as last rendered (Oct 18, 2026), and `shots/options/` the D1 and D2 option states. These are what builders compare their stories against. Delete a board's shot with the board.
- `grocs.css`: the canvas tokens. Their values move into `packages/ui/src/tokens/tokens.json` once (R59, TASK-1.19); after that this file is not maintained.
- The design reviews that shaped these boards are doc-2.

Art sources extracted from the boards live in `design/svg/` (R62), and `grocs.css` values are now in `tokens.json` (TASK-1.19). The `reference-built` check fails when a board's name is also built in `packages/ui` or `apps/mobile`.
