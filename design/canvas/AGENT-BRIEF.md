# Grocs design fix - shared brief for every agent

Grocs is a two-person grocery list and meal plan app (iOS and Android) with a cute, mushroom-hosted look. The design is a canvas of HTML artboards in `project/`. Two reviews (`REVIEWS.md`) found the design system is a catalogue, not a system: nothing is shared, copies drift, tokens are loose. The fix makes it a real system: one token stylesheet, shared child components, and screens plus design-system boards built from them.

Written for the Oct 18, 2026 canvas fix. The format and rules sections still apply; the phases and file list are history. In this repo the boards are in `design/canvas/` (the brief's `project/`), the reviews are doc-2, and the checker is `design/canvas/tools/dc_check.py`.

## Ground rules

- Edit only the files your task names. Other agents are editing other files at the same time.
- Never publish anything. The orchestrator reviews and publishes.
- Only the foundation task writes `project/canvas.json` and `project/grocs.css`. Everyone else treats them as read-only; if you need a token or component that doesn't exist, report it instead of creating it.
- Keep every screen's behaviour, copy and look unless a review finding says to change it. This is a refactor plus fixes, not a redesign.
- Run `python3 tools/dc_check.py project` before you finish. It must exit 0. Paste its summary line in your report.
- You cannot render the files. Be exact with markup instead.
- Report (under 300 words): files changed, which review findings you fixed (by number or name), anything you could not do, and any token or component you needed but didn't have.

## The artboard format (.dc.html)

Each artboard is one self-contained Design Component page:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Short name</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="grocs.css">
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&amp;family=Nunito:wght@500;600;700;800&amp;display=swap">
<style>body{margin:0}</style>
</helmet>
<div style="width: 390px; height: 844px; ...">...</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
```

Rules that fail silently if broken:

- Keep `<script src="./support.js"></script>` exactly. Close every non-void element, including SVG children (`<path ...></path>`), and quote every attribute.
- `{{hole}}` is a dotted lookup into `renderVals()` only, never an expression. Compute in `renderVals()`.
- Whole-value attribute `x="{{fn}}"` passes the raw value (functions, numbers, arrays). `x="a {{p}} b"` interpolates a string. Events use JSX camelCase: `onClick="{{pick}}"`.
- `<sc-if value="{{cond}}" hint-placeholder-val="{{true}}">` and `<sc-for list="{{items}}" as="item" hint-placeholder-count="3">` (with `{{item.x}}`, `{{$index}}`). Always set the hint attributes. Don't put sc-if or sc-for inside an `<svg>`.
- Logic is classic JS (no imports): `class Component extends DCLogic` with `this.props`, `state`/`setState`, React class lifecycle, no `render()`. All UI is markup, never built by script.
- `data-props` is single-quoted JSON: `&amp;` for `&`, `&#39;` for a single quote. It declares tweakable props with editors (`"editor": "text"|"color"|"int"|"boolean"|"enum"|null`, `"default"`, `options` for enum) and `$preview: {width, height}`. Callbacks and objects use `"editor": null`. Read props with a fallback: `this.props.x ?? default`.
- Inline `style="..."` is what the editor's properties panel edits. `<helmet><style>` is for page basics only. Shared classes and keyframes live in `grocs.css`.
- No network except the Google Fonts link in `<helmet>` and `grocs.css`. No iframes, no emoji, no global key handlers. Icons are inline stroke SVG.
- Accessibility: real `<button>`, `<a href>`, `<input>` + `<label>`, with `aria-label` on icon-only buttons. Decorative SVG gets `aria-hidden="true"`. Text contrast 4.5:1. Touch targets at least 44×44.
- Links between artboards: `<a href="Plan.dc.html">` (style the `<a>` itself as the button).

### Child components (the point of this fix)

- `<dc-import name="Mascot" who="cremi" size="64" hint-size="64px,64px"></dc-import>` mounts the sibling file `Mascot.dc.html`. Every other attribute becomes a prop (kebab-case becomes camelCase, read as `this.props.who`). Pass objects, arrays and functions with whole-value holes: `meals="{{item.meals}}"`, `on-toggle="{{item.toggle}}"`. Never self-close, never use a capitalised tag, and never name a prop `name`.
- `hint-size="W,H"` is the placeholder box until the child renders, so match the child's root size. It works inside `<sc-for>`.
- A child is also an artboard of its own. It needs its importer's `<head>` lines so it renders alone. Its `<helmet>` reruns in importers, so it may only hold the font `<link>` and `body{margin:0}`. Put `font-family` and `color` on its root element, and shared CSS in `grocs.css`.
- Each child keeps its own state. That lets a Mascot own its tap reaction, speech bubble and timers.
- Declare every prop in the child's `data-props` (objects and callbacks with `"editor": null`).

### canvas.json (foundation task only)

`project/canvas.json` lists every artboard under `boards` (keyed by file name, with `x`, `y`, `w`, `h` equal to its `$preview`, optional `title`, `page`, `is_interactive`) and in `order`. Pages: `app` (screens) and `ds` (design system). Keep every existing key and value you aren't changing. Leave 80px between frames in a row and 120 between rows.

## Current files

- Screens (page `app`): Welcome, EmailSignIn, Household, JoinInvite, Plan, AddMeal, Main (Groceries), QuickAdd, RecipeImport (`project/<Name>.dc.html`).
- Design system (page `ds`): DS-Tokens, DS-Atoms, DS-Molecules, DS-Organisms, DS-Templates.
- `tools/dc_check.py`: the mechanical checks. It warns about raw hex outside `grocs.css`, outside SVG illustration.

## Phases

1. Foundation, one agent: `project/grocs.css` and the shared components.
2. In parallel, three agents with no shared files: app screens, sign-in screens, design-system boards.
3. An independent reviewer checks everything against `REVIEWS.md`.

## Spec alignment (phase 2, added Oct 18)

The product spec has moved since the reviews. These changes are in scope for phase 2 alongside the review fixes:

- Sign-in is Google only. Remove EmailSignIn from the app page and from every link to it.
- Recipe extraction is parked. Keep RecipeImport but title its board "Parked: recipe import" and unlink it from the screens.
- A dropped meal does not move to next week. Remove the "Moved from last week" card from Plan.
- A day can hold more than one meal, in the order added. Show at least one day on Plan with two meals.
- Plan's tab badge comes from the same computed count as Main's, not a hard-coded 14.
- New boards (app screens agent): Settings (notifications toggle, off by default; copy diagnostics; sign out), and states for offline / waiting to send, an invalid invite code error on JoinInvite, and the in-app toast when the other member adds something.
- Every interactive atom shows rest, pressed, focus and disabled, plus loading and error where they apply.
