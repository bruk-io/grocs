# Art sources

SVG sources for icons, mascots and scenes, converted to React Native components by a tool, run the same way each time (spec R62; the tool is decided in D9). Edit the SVG here, run `pnpm svg`, commit both. Never edit the generated components: `pnpm check` fails (`svg-art/generated-in-sync`) when they differ from what the SVG produces.

- `icons/`: 24 point grid, one 2 point round stroke, `currentColor`. Generated to `packages/ui/src/icons/generated/`.
- `mascots/`: one file per mushroom (cremi, shii, chanty, ollie, morty, enoki). Moving parts carry ids that are the part names: `body`, `cap`, `eyeL`, `eyeR`, `mouth` are required; `stem`, `blushL`, `blushR`, `brows`, `eyesShut`, `glassesL`, `glassesR`, `sparkle`, `zzA`, `zzB`, `stalkL`, `stalkC`, `stalkR` are optional (decision-5). Generated to `packages/ui/src/mascots/art/`. The Welcome prop poses (spoon, tomato, scrub) are not extracted yet.
- `scenes/kitchen.svg` and `scenes/kitchen-door.svg`: the Welcome kitchen scene and its door, with named groups for the animated parts. Generated to `packages/ui/src/organisms/kitchen/art/`.

Colours in the SVG must be hex values listed in `color.mascot` or `color.scene` in `packages/ui/src/tokens/tokens.json`; the converter writes them as token references and fails on an unknown colour.
