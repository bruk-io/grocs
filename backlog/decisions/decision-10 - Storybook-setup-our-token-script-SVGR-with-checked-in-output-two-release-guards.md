---
id: decision-10
title: >-
  Storybook setup: our token script, SVGR with checked-in output, two release
  guards
date: '2026-10-18 19:01'
status: accepted
---
## Context

Design question D9 in doc-1 (TASK-1.14): how Storybook is set up (decision-2). It covers token generation, story conventions for every state, keeping the on-device route out of release builds, the SVG conversion tool for icons, mascots and the kitchen scene, and whether the browser build is hosted for Shazya.

Requirements served:
- R59: one token file; the app's tokens are generated from it and checked.
- R60: design levels import downward.
- R61: rest, pressed, focus and disabled states, plus loading and error where they apply.
- R62: one icon set using the token stroke; one Mascot with data.
- R63: a story per declared state, checked.
- R64: the same stories in the browser and on both phones; the on-device route only in development builds.
- R65: component tests render the stories.
- R66: the canvas is retired; its boards are a read-only reference in `design/reference/`, deleted as each is built.

decision-5 adds two needs: mascot parts named in the converted art (`body`, `cap`, `eyeL`, `eyeR`, `mouth`), and motion tokens, including easings.

As built (TASK-1.4):
- `packages/ui/src/tokens/tokens.json` is the source. `tools/build-tokens.ts` (`pnpm tokens`) writes `tokens.ts`. The `design-tokens` check fails a stale `tokens.ts`, raw colours and sizes in `packages/ui/src`, and any text pair under 4.5:1. The canvas stylesheet isn't generated yet; the canvas hasn't moved.
- Each component exports `<NAME>_STATES` as a const array beside it, with one PascalCase story per state (`Rest`, `InCart`, `Pressed`, `Focus`, `Disabled`). Pressed and focus are drawn through a `forceState` prop. Extra stories that are not states are allowed (`WithAmountAndBadges`). The `story-coverage` check enforces the states-to-stories match.
- Browser Storybook 10.6.2 with `@storybook/react-native-web-vite`. `preview.tsx` has iPhone and both Fold viewports (approximate Pixel 9 Pro Fold sizes) and an iOS/Android platform toolbar. `stories.test.tsx` composes every story with `composeStories`, renders it in jsdom and checks that roles have accessible names. `build-storybook` succeeds.
- On-device Storybook isn't built. `release-bundle.ts` already looks for a `grocs-storybook-marker` string. Development code loads only through `if (__DEV__) require('../dev/index.ts')` in `load-dev.ts`.

What I found:
- Storybook for React Native 10.7.0 (13 Oct 2026; peers `storybook ^10.5.4`, Reanimated, gesture-handler, `@gorhom/bottom-sheet`, safe-area-context). Its Metro wrapper `withStorybook(config, { enabled })` strips Storybook from the bundle when `enabled` is false: modules under `.rnstorybook` resolve to empty modules and the UI becomes a stub. Its author recommends an Expo Router route behind `Stack.Protected`.
- Expo Router bundles every file under `app/` through `require.context`. A `app/storybook.tsx` route file is therefore always in the release bundle; only what it imports can be dropped.
- SVGR 8.1.0 (last release August 2023) has a `native` mode that emits react-native-svg components and drops unsupported nodes. It supports TypeScript output, custom templates and `replaceAttrValues` with expressions such as `{props.color}`. It enables SVGO's `prefixIds` implicitly, which rewrites ids.
- react-native-svg-transformer 1.5.3 converts SVG at bundle time inside Metro.
- Style Dictionary is at 5.7.0.
- The `firebase-isolation` check fails on any `firebase deploy` and any non-demo project id in the repo. That rules out Firebase Hosting from this repo's CI without loosening a check.
- Chromatic's free plan includes 5,000 snapshots a month. Cloudflare Access is free for under 50 users and protects self-hosted apps. Bruk already runs his personal Cloudflare Workers behind Google sign-in from one repository, deployed by GitHub Actions.

Options weighed:

Token generation
- Our script (keep, extend). One JSON file, two outputs (TypeScript now, CSS custom properties for the canvas later), 31 lines, and its in-sync check already exists.
- Style Dictionary 5.7. Built for many platforms and formats. Here it would add a config file, transforms and a dependency to produce two files, and the check would still be ours.

On-device exclusion
- The route plus `__DEV__` only. One removal mechanism. Metro folds `__DEV__`, and `release-bundle` proves the result. But it relies on nothing in a shipped file importing `.rnstorybook` statically.
- The route plus `__DEV__` plus `withStorybook({ enabled: false })` in release. Two independent removals, and the same check proves both.
- An environment flag only (`EXPO_PUBLIC_STORYBOOK_ENABLED`, as in Storybook's own guide). Easy to leave on in a release build. The skeleton rejected flags for that reason.

SVG conversion
- SVGR CLI or core, run by our script, with the output checked in. The same `.tsx` is used by Metro, Vite and vitest. Templates and attribute replacement give token strokes and colour props. The output can be checked for being in sync like tokens. Ids need SVGO's `prefixIds` turned off. SVGR is unmaintained since 2023, but because the output is committed, a dead SVGR freezes the generator, not the app.
- react-native-svg-transformer. Converts at bundle time in Metro only. The browser Storybook (Vite) and vitest would each need their own SVG plugin with different output: three paths to the same art. There is no place to rename mascot parts or map colours to tokens.
- Hand conversion. Ruled out by doc-1 ("with a tool, run the same way each time").

Hosting the browser build
- Not hosted. Shazya sees components only on Bruk's laptop or in a development build. Her phone gets TestFlight release builds, which have no Storybook.
- Chromatic. Hosted per build with access control, and later visual review. Shazya needs a Chromatic account, it is a third-party service, and the snapshot quota applies once visual tests are on.
- A Cloudflare Worker serving static assets, behind the same Google sign-in as Bruk's other workers. It matches how he already runs and deploys personal sites. Cost: a cross-repository deploy, because his worker code lives in its own repository.
- Firebase Hosting. Blocked by `firebase-isolation` (no deploy commands, no real project ids in this repo), and its sites are public.

## Decision

Tokens:
- Keep `tokens.json` and `tools/build-tokens.ts`.
- Add the `motion.easing` group (decision-5) and the mascot palette (`color.mascot.*`) to `tokens.json`.
- The canvas was retired on Oct 18, 2026, so no canvas stylesheet is generated. The values in `design/reference/grocs.css` move into `tokens.json` once (TASK-1.19).

Story conventions (R61, R63, R65):
- Each component file exports `<NAME>_STATES` as a const array. The stories file exports one story per state, named in PascalCase.
- Pressed and focus are drawn through `forceState`. Loading and error are ordinary props.
- `meta.title` is `<Level>/<Name>`, where Level is Atoms, Molecules, Organisms, Templates or Mascots.
- Stories pass args only and import nothing outside `packages/ui` beyond Storybook types; `import-layers` already enforces this.
- Stories that are not states are allowed when their names don't match a state.
- New rule `story-coverage/interactive-states` (R61): a component whose JSX contains `Pressable`, `TextInput` or a `role` prop must declare `rest`, `pressed`, `focus` and `disabled`. A component that sets `loading` or `error` props must declare those states too.
- Browser and on-device toolbars: platform (iOS or Android), viewport (iPhone, Fold outer, Fold inner; the sizes stay approximate until D2), and reduce motion (decision-5).

On-device Storybook (R64):
- Packages: `@storybook/react-native` 10.7.x in `apps/mobile`, plus its peers (`react-native-gesture-handler`, `@gorhom/bottom-sheet`; Reanimated and safe-area-context come with decision-5 and the app), all installed with `npx expo install`.
- Config: `apps/mobile/.rnstorybook/main.ts` with `stories: ['../../../packages/ui/src/**/*.stories.tsx']`, and a `preview.tsx` that shares the decorators by importing them from `packages/ui/.storybook/decorators.tsx`. The browser `preview.tsx` is split so both use the same file.
- Metro: `apps/mobile/metro.config.cjs` wraps the config in `withStorybook(config, { enabled: process.env.NODE_ENV !== 'production', configPath: './.rnstorybook' })`.
- The UI lives in `apps/mobile/src/dev/storybook.tsx`. It imports `.rnstorybook` and exports the `grocs-storybook-marker` string, and `devTools` exposes it as `devTools.Storybook`.
- The route is `apps/mobile/app/storybook.tsx` and holds no Storybook code. It renders `loadDevTools()?.Storybook`, or redirects to `/` when that is null. The root layout guards the route with `Stack.Protected guard={__DEV__}`. A "Storybook" row in the dev sign-in screen opens it.
- Proof: `pnpm check:release` finds the marker in the development bundle and not in the release bundle, on both platforms. The release bundle loses Storybook both through `__DEV__` folding and through `withStorybook`, so either one alone still passes.

SVG conversion (R62, decision-5):
- Tool: `tools/build-svg.ts` (`pnpm svg`), using `@svgr/core`, `@svgr/plugin-svgo` and `@svgr/plugin-jsx` 8.1.0 with `native: true`, `typescript: true` and `jsxRuntime: 'automatic'`.
- Sources live under `design/svg/{icons,mascots,scenes}/*.svg`.
- Icons are written to `packages/ui/src/icons/generated/<Name>.tsx`, plus a generated `icons/index.ts` that maps names to components. Stroke widths are replaced with `{tokens.stroke.icon}`, and the stroke and fill colour with `{color}` (a prop that defaults to `tokens.color.text`). `svgProps` sets `accessibilityRole: 'image'` (or hides the icon when it is decorative), and the size comes from `tokens.size.icon`.
- Mascots and scenes are written to `packages/ui/src/mascots/art/<Name>.tsx` and `packages/ui/src/organisms/kitchen/art/*.tsx`.
  - SVGO's `prefixIds` and `cleanupIds` are turned off, so the ids survive.
  - A post-pass in the same script, a TypeScript AST transform, turns every element whose `id` is a declared part (`body`, `cap`, `eyeL`, `eyeR`, `mouth`) into `<Part name="eyeL" as={Ellipse} … />`. `Part` is supplied by the Mascot component, which animates it (decision-5).
  - Every hex colour is mapped to a `color.mascot.*` token. The script fails if a colour has no token, so `design-tokens/raw-value` stays meaningful.
- Each generated file starts with a `GENERATED from design/svg/... by tools/build-svg.ts` header.
- New check `svg/generated-in-sync` (R59, R62): rerunning the generator in memory must reproduce every generated file, and every SVG source must have its output. decision-5's mouth-path structure check runs on the same parsed source.
- The `reference-built` check (R66, decision-9) reads the generated names to find components that are both built and still in `design/reference/`.

Hosting the browser build:
- Hosted for Shazya as a static-assets Cloudflare Worker (`wrangler` 4.x) behind the same Google sign-in as Bruk's other workers, with access for Bruk's and Shazya's Google accounts only.
- The worker package lives in Bruk's workers repository, beside his others.
- On every push to `main`, the Grocs CI `bundles` job uploads `packages/ui/storybook-static` as a workflow artifact named `storybook`. The workers repository's deploy workflow downloads the latest `storybook` artifact from Grocs (`actions/download-artifact` with `repository` and `run-id`) and deploys it.
- No Cloudflare credentials are kept in the Grocs repo, and no deploy command runs in it, so `firebase-isolation` and the repo's no-deploy stance hold.
- The page shows a banner from `preview.tsx`: "Browser preview: shadows, text and native controls differ from the phones" (decision-2).

## Consequences

- Each of SVG, tokens and stories has one source and one generator, and its output is checked in and checked. Changing art means editing the SVG and running `pnpm svg`, never editing the `.tsx`.
- The mascot art is tied to five part names and the mouth's path structure. A redrawn mascot that renames a part fails the generator, with a message naming the part.
- SVGR's maintenance risk is accepted. If a needed fix never comes, the post-pass grows or the generator is replaced, and the checked-in output keeps the app working meanwhile.
- On-device Storybook brings `react-native-gesture-handler` and `@gorhom/bottom-sheet` into the app's dependencies. Their JavaScript is stripped from release builds, but gesture-handler's native code is compiled into the release binary (size not measured). That is acceptable, and it is likely needed by the app's own gestures anyway.
- The `app/storybook.tsx` route file is in every release bundle (Expo Router includes every file under `app/`). It holds a redirect and nothing else, which the marker check proves.
- Hosting depends on the workers repository's Google gate working for an assets-only worker, and on a cross-repository artifact download. Neither is verified here. If the gate can't wrap static assets, the fallback is Cloudflare Access in front of the same worker (free for under 50 users), with Shazya's Google account allowed.
- Ruled out: Firebase Hosting from this repo, bundle-time SVG transforms, hand-converted art, and an environment flag as the only release guard.
- Still open: the Fold viewport sizes (D2); whether to turn on Chromatic visual review later, which is a quota decision; and whether Shazya reviews in the hosted browser build, on a development build installed on her iPhone, or both.

## Sources

- How to swap between React Native Storybook 10 and your app (`withStorybook` `enabled` strips Storybook; Expo Router protected route): https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-10-and-your-app-e9e
- Storybook for React Native, v9 to v10 migration: https://www.mintlify.com/storybookjs/react-native/migration/v9-to-v10
- SVGR options (`native`, `typescript`, `template`, `replaceAttrValues`, `svgProps`, implicit `prefixIds`): https://react-svgr.com/docs/options/
- react-native-svg-transformer: https://docsearch.algolia.com/mcp/docs/repo/kristerkari/react-native-svg-transformer
- Chromatic free plan snapshot limit (5,000 a month): https://chromatic.com/docs/faq/free-plan-snapshot-limit
- Cloudflare Access (free for teams under 50 users, self-hosted apps): https://www.cloudflare.com/en-au/products/cloudflare-access
- npm registry, checked 2026-10-18: `@storybook/react-native` 10.7.0 (peers listed above), `storybook` and `@storybook/react-native-web-vite` 10.6.2, `@svgr/cli` and `@svgr/core` 8.1.0 (published 2023-08), react-native-svg-transformer 1.5.3, style-dictionary 5.7.0, chromatic 18.13.0, wrangler 4.151.1
- Repository evidence: `tools/build-tokens.ts`, `tools/checks/{design-tokens,story-coverage,firebase-isolation}.ts`, `tools/release-bundle.ts`, `packages/ui/.storybook/{main,preview}.ts(x)`, `packages/ui/src/stories.test.tsx`, `apps/mobile/src/composition/load-dev.ts`; decision-2, decision-5; TASK-1.4 D9 findings
