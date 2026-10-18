# Design canvas

The source of the Grocs design artifact on claude.ai (a Design artifact, private to Bruk). Per spec R66, the canvas holds only what isn't built yet: once a component or screen is built in `packages/ui` or `apps/mobile`, its stories are its record and its board here is removed.

- `*.dc.html`: one board each, in the Design Component format. `AGENT-BRIEF.md` describes the format and the rules that fail silently.
- `canvas.json`: the board layout and pages (`app`, `ds`, `options`).
- `grocs.css`: the shared tokens. R59 will generate it from `packages/ui/src/tokens/tokens.json` (DRAFT-2).
- `source/kitchen-scene.svg`: the Welcome screen's kitchen scene.
- `tools/`: `dc_check.py` (the board checker), `gen_ds.py`, `ds_lib.py` and `gen_boards.py` (generators for the design-system boards), `tx.py` (the token pass for screens) and `render.js` (renders boards with Playwright into `.shots/`).

Check the boards:

```sh
python3 design/canvas/tools/dc_check.py design/canvas
```

Render them (Playwright and Chromium needed):

```sh
npm install --prefix design/canvas/tools && node design/canvas/tools/render.js
```

The artifact's published paths are `project/<file>`. Before publishing, list the artifact's files and compare them with this folder: edits made in the canvas editor save a new version there, and they are committed here before anything else is published.
