---
id: doc-2
title: 'Design reviews of the canvas design system (Oct 18, 2026)'
type: other
created_date: '2026-10-18 19:03'
updated_date: '2026-10-18 19:03'
---
Status: every finding below was fixed in TASK-1.17, except the child-component refactor (review B findings 1 and 2, and the parts of review A only that refactor would fix), which was dropped when the canvas became a sketchpad for unbuilt designs (R66). Those are fixed when the components are built in code. The item-by-item status is in TASK-1.17's closing notes.


Two independent reviews of the Grocs design system against atomic design. Fix work must address both.

## Review A - hierarchy and composition

Verdict: all five levels exist, but captions name parts and variants that are never defined, several items sit at the wrong level, and recurring values (radius 16) bypass tokens.

High
- Captions name parts that don't exist: "small" (progress, meal.card, suggestion.row, toast) has no type token or atom; "label/body/heading/title" are type tokens, not atoms. Undefined variants are cited: "button.icon (ghost)" (stepper), "(soft)" (suggestion.row), "button.primary (small)" (invite.card), "input.text (inline)" (add.bar), "icon (tile)" (30px, r10). Fix: add text atoms (text.label, text.body, text.small, text.micro) and every variant at atom level, or make the captions match what exists.
- Wrong level: speech.bubble and invite.code contain no atoms, so they are atoms. day.row nests one molecule (meal.card) inside another, so it is an organism (or meal.card becomes an atom). action.bar is one pinned button: a template region, not an organism.
- Pages table names organisms that don't exist: "kitchen scene", "invite summary", "auth buttons", "chips", "suggestion rows", "meal summary". "field" is a molecule. Join is listed as template.task but auth.sheet says "Welcome, Join".
- Values bypass tokens: radius 16, 18, 10, 22; colours #000000, #2F3D33, #E9ECE6, #CBD3C6, #5A665E; nav shadow 0 10px 24px rgba(..0.12); button lip 0 4px 0; gaps 6/10/14/18/28; type 10/12/14/17/19/26. Fix: add radius.16, ink.on-tint, shadow.lip-soft, space steps, type.small 12, and snap the rest.

Medium
- Copies drift from their source: organism rows are 56 tall without avatar vs the 60-tall item.row; invite code 24 vs 26; buttons 48/58 vs 54; header mascots missing paths. Fix: reference molecules instead of hand-copying.
- Type tokens are ranges ("heading 17-22", "display 60-64"), so they can't be checked. radius.xl 28 appears in a caption only. Fix: one value per token.
- Icon stroke varies 2 to 3.2 though the system claims 2px. Icons have no names (icon.cart). The icon atom and its tile container are drawn as one thing.

Low
- Inconsistent state naming ("check · on", "avatar.l online", "item.row · done", "(struck)"). Bare names (field, progress, stepper). ink and line tokens drop the "color." prefix. Combined cards ("presence + toast", "nav.tabs · action.bar · auth.sheet"). Fix: name.variant--state and one card per item.
- pill.date names a shape, not a role: rename tag.date.
- suggestion.row add button is 38x38, under the 44 minimum.

Missing states: buttons rest only (no pressed, focus, disabled, loading); input.text has no filled, error or disabled; no error or disabled colour tokens; item.row pressed/swipe; add.bar focus; selected chip; empty list; recipe import skeleton/loading; invalid invite code; offline / sync status.

## Review B - does it work as a system across the pages

Verdict: a good catalogue of what the screens look like, but not a system. No screen imports anything, every part is hand-copied, and the copies have drifted. The DS files also break their own token rules.

High
1. Nothing is reused: no <dc-import> anywhere. Bubble markup and bubA/bubB keyframes pasted into 9 screens; poke() timer logic in 7; header.sub copied into 6; tab bar into Main and Plan; mascot SVGs 4-5 times each. 35-50% of each screen duplicates system parts. Fix: make Mascot (who prop, bubble, poke logic), HeaderSub, HeaderMain, NavTabs, ItemRow, ActionBar and Field into child DCs; screens and DS boards import them.
2. Copies have drifted: Welcome Cremi eyes at cx 27/35 vs 28/36 elsewhere; Organisms Cremi missing highlight and Chanty missing gills; Welcome enoki stems stretched (M20 66); bubble shadow 0.14 in DS and Welcome vs 0.12 in 7 screens.
3. Radius and type scales are fiction: tokens list 14/20/24/28/pill but screens use 16 (21x), 18 (8x), 22 (8x); DS-Atoms itself uses 16. "body 13-15" ranges make anything legal; screens use 10, 12, 18, 19, 28, 30. Fix: add 16 and 18, drop 22, one value per token.

Medium
4. Same molecule, different sizes: item.row 60 (Main) / 58 (RecipeImport) / 56 (Organisms); tabs 48/50/52; primary button 54/r20 (Atoms) vs 58/r22 (action.bar); text inputs 52 (Atoms) vs 56 (AddMeal, EmailSignIn, Household); invite code 24/26/30.
5. Action bar uses an off-token shadow: 0 6px 0 #143522, 0 14px 24px rgba(23,36,27,0.2) (5 times).
6. Inputs never show rest: AddMeal, EmailSignIn, Household draw the focus style as the default.
7. Off-token colours: #2F3D33 (7 screens), #E9ECE6, #5A665E, #CBD3C6, #E1E9E4, #9CC3DC; Main's accent prop offers #2D5B7A/#6B3A7A/#8A3B2E; Main JS hard-codes a MEALS colour map; spacing 6px (50x), 10px (40x), 14px (18x) on a "4-point" scale.
8. Patterns with no DS counterpart: week navigator (Plan), inbox-sent card (EmailSignIn), waiting/joined status rows (Household), inviter summary card (Join), All done banner and tick spark burst (Main), recipe summary card (RecipeImport), kitchen scene, selected meal chip, section heading without icon (QuickAdd), small primary "Add" inside a field.
9. Pages table wrong: Join is a stage/task hybrid (wordmark, no back link, no action bar, inline auth buttons); RecipeImport has no section header; QuickAdd uses a focused field with a text button, not add.bar; Household has no back link; Plan's header has week arrows header.main doesn't define; Main's toast, In the cart and Clear the cart are missing.

Low
10. Screen names differ: canvas.json "Plan a meal" / "Shared list" / "Quick add" vs DS-Templates "Add a meal" / "Groceries" / "Add an item".
11. Plan hard-codes the tab badge 14; Main computes {{remaining}}.
12. Coverage isn't the problem, drift is.

Top changes: (1) importable child DCs for mascots, both headers, tab bar, item.row, field, action bar, with DS boards rendering the same components; (2) one shared token stylesheet with fixed values (16/18 radii, second shadow, missing colours) and inline hex replaced; (3) fix the templates table and add organisms for kitchen scene, week navigator, status row, summary card, celebration banner.
