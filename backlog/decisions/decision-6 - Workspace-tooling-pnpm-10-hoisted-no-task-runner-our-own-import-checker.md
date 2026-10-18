---
id: decision-6
title: 'Workspace tooling: pnpm 10 hoisted, no task runner, our own import checker'
date: '2026-10-18 19:01'
status: proposed
---
## Context

Design question D3 in doc-1 (TASK-1.8): which package manager, task runner and import checker hold the repository layout together, including the check that design levels import only downward. Requirements served: R26 and R27 (layer table, no cycles, providers isolated, checked after every edit, at pre-commit and in CI, with the rule and its reason in every failure), R55 and R56 (one set of scripts for hooks, pre-commit and CI; after-edit checks under 5 seconds), R60 (atoms < molecules < organisms < templates).

The walking skeleton (TASK-1.3, TASK-1.4) made provisional choices: pnpm 10.28.0 with `node-linker=hoisted` and `auto-install-peers=true` in `.npmrc`; no task runner, only root `package.json` scripts; a custom checker in `tools/checks/import-layers.ts` built on `ts.preProcessFile`; checks and hooks run as TypeScript by Node's built-in type stripping (`engines.node >=22.18`, CI on Node 22); Expo's Metro config with `watchFolders` and `nodeModulesPaths` set by hand.

What I checked in the code (2026-10-18):
- `pnpm check` runs 8 checks in 349 ms (all mode) and 416 ms (files mode); the whole node process takes about 1 s. The 5 s budget has plenty of room.
- Two in-memory probes of `import-layers.ts` show gaps in the R60 rule. A molecule importing an organism through the ui package's own `src/index.ts` is reported only as `no-cycles`, not as `design-levels`, so the message names the wrong rule. An atom importing `../platform/p.tsx`, which imports an organism, passes: folders under `packages/ui/src` that are not in the level table (`platform/` today) are checked neither as importer nor as target, so a level can climb through them.
- The skeleton's reason for the hoisted linker ("Metro does not follow pnpm's symlinked layout") is out of date. Expo's monorepo guide says isolated installs are supported from SDK 54, and that from SDK 52 `expo/metro-config` configures monorepos itself, so `watchFolders` and `resolver.nodeModulesPaths` should be removed. It also warns that some React Native libraries still break under isolated installs, and that some hard-code `react-native` paths in Gradle or Podfile files. The native builds (prebuild, Gradle, CocoaPods) have not run in either mode.
- pnpm has moved on. The latest 10.x is 10.34.7 (12 Oct 2026), 11 is at 11.28.6, and 12.14.0 is `latest` (12.0.0 came out on 26 Aug 2026 as a Rust rewrite). pnpm 11 no longer reads non-auth settings from `.npmrc`. The skeleton keeps `node-linker=hoisted` in `.npmrc`, so on pnpm 11 that setting would be dropped without a warning and the install would quietly become isolated. pnpm 11 also turns on `minimumReleaseAge: 1440`, `strictDepBuilds` and `blockExoticSubdeps` by default.
- Node: type stripping has been on by default with no warning since 22.18, and stable since 24.12 and 25.2. The `--disable-warning=ExperimentalWarning` flags in the scripts no longer do anything. decision-4 puts Cloud Functions on Node 24.

Options weighed:

Package manager
- pnpm 10 (keep, bump to 10.34.x). It works today with a frozen lockfile. Workspace protocol, filters and `packageManager` pinning are all in place. The settings need to move out of `.npmrc` before any major upgrade.
- pnpm 11. Its security defaults (release age, strict builds) are worth having, but `strictDepBuilds` means listing every package with a build script (firebase-tools, lefthook, esbuild via Vite) under `allowBuilds`. That is a migration with no payoff for the decision itself.
- pnpm 12. Seven weeks old, a rewrite, and not in the usual installers yet. No reason to be first.
- npm workspaces or Yarn. These were rejected by the skeleton and nothing has changed. npm has no `--filter`, no catalog and no `packageManager` enforcement. Yarn Berry's PnP needs its own Metro work.

Linker
- Hoisted (keep). It bundles today for both platforms, in dev and release (`pnpm check:release`). The cost is phantom dependencies: a package can import a library it never declared. Only the import-layer allow-lists stop that, and they cover only `core`, `ports`, `application` and `ui`.
- Isolated (pnpm's default). Packages see only what they declare, which enforces R26 at install time as well. Expo supports it from SDK 54, but it is unproven for this repo's native modules (`@react-native-firebase/*`, Reanimated, react-native-svg) because no dev client has been built yet.

Task runner
- None, only pnpm scripts and `pnpm --filter` (keep). Every step is fast now: checks about 1 s, 226 unit tests, and an emulator suite that starts its own processes.
- Turborepo or Nx. Their task caching and dependency-ordered runs pay off when builds are slow and packages are many. Here there is no build step (packages export TypeScript source), and the only slow steps (emulators, Expo export, Storybook build) can't be cached safely. They would add a config file, a cache directory and a second place where commands are defined.

Import checker
- Custom script (keep). About 300 lines, with no dependency beyond `typescript`, which the repo already has. It prints the same `FAIL rule (reqs) / Why / Fix` block as every other check. Its fixture tests assert the message text. It encodes rules that are awkward elsewhere: the `@grocs/<pkg>/testing` entry limited to tests, stories and `testing/` folders, the release-bundle reason behind it, and design levels. Cost: we own the resolver. It handles only relative paths, `@grocs/*` and bare package names, so `tsconfig` `paths` or package `exports` maps it doesn't know about would slip through.
- dependency-cruiser 18.6.0. A mature resolver with rule `comment`s and path-group matching, so R60 can be expressed. The skeleton's note that it cannot print the reason is too strong, since rules carry a comment. It still brings a second finding format, a JavaScript config file, and a separate graph pass in every hook run.
- eslint-plugin-boundaries 7.2.0. It needs ESLint, which this repo doesn't use. ESLint's start-up in the after-edit hook would cost more than the whole current check run.

## Decision

Package manager: pnpm 10, pinned through `packageManager: "pnpm@10.34.7"` in the root `package.json`.
- Move every setting out of `.npmrc` into `pnpm-workspace.yaml` (`nodeLinker: hoisted`, `autoInstallPeers: true`) and delete `.npmrc`. That way a later major upgrade cannot silently drop them. Add `minimumReleaseAge: 1440` now, matching pnpm 11's default.
- Proof of the move: after `pnpm install --frozen-lockfile`, `node_modules/react-native` is a real directory, not a symlink, and `pnpm check:release` passes.
- Moving to 11 is a separate size-1 task. Wait for 12 until it has a few months of releases.

Linker: keep `nodeLinker: hoisted`, and record the corrected reason in `pnpm-workspace.yaml`: "kept until a dev client builds under isolated installs; Expo SDK 54+ supports isolated, but our native modules are unproven".
- When the first dev client is built (needed for TASK-1.16), build it once with isolated installs. If Gradle, CocoaPods and Metro all succeed, switch and drop the reason.

Metro: remove the hand-set `watchFolders` and `resolver.nodeModulesPaths` from `apps/mobile/metro.config.cjs`, leaving `getDefaultConfig(projectRoot)`, which Expo's docs say handles monorepos from SDK 52. The proof is `pnpm check:release` passing on both platforms. If it fails, keep the lines and note the error beside them.

Node: Node 24 LTS everywhere, the same runtime decision-4 uses for Cloud Functions.
- `engines.node: ">=24.12"` in the root `package.json`, a root `.node-version` containing `24`, and `node-version: 24` in each `.github/workflows/ci.yml` job.
- Drop `--disable-warning=ExperimentalWarning` from scripts, hooks and `.claude/settings.json`.
- Keep the type-stripping constraints that `tsconfig.json` already implies (`verbatimModuleSyntax`, `allowImportingTsExtensions`, `.ts` extensions in imports). Add `erasableSyntaxOnly: true` so `tsc` rejects enums, parameter properties and namespaces with values, which Node would refuse at run time.

Task runner: none. Root scripts stay the only command surface: `check`, `check:edit`, `check:release`, `test`, `test:emulator`, `typecheck`, `tokens`, `emulators`, plus D8's `verify:fast` and `verify` and D9's `svg`. Per-package work goes through `pnpm --filter <pkg> <script>`. Revisit if CI wall time passes 10 minutes or the repo gains a package with a real build step.

Import checker: keep `tools/checks/import-layers.ts` as the single checker for R26, R27 and R60, and close the gaps the probes found.
- `packages/ui/src` gets a full folder table, and every folder must appear in it:
  - `tokens`: nothing.
  - `platform`, `icons`, `mascots`: foundations that may import `tokens` only.
  - `atoms`: `tokens`, `platform`, `icons`, `mascots`.
  - `molecules`: atoms plus everything atoms may import.
  - `organisms`: molecules and below.
  - `templates`: organisms and below.
- New rule `import-layers/unknown-ui-folder` (R60): a folder under `packages/ui/src` that is not in the table fails. Its message names the table, so a new folder is a decision rather than a loophole.
- New rule `import-layers/no-self-barrel` (R60, R27): a file inside a package may not import that package's own `src/index.ts`, by relative path or by its `@grocs/` name. The barrel is for other packages, and going through it hides which level a file reaches.
- Fixture tests for both rules in `tools/checks/import-layers.test.ts`, asserting the rule id, Why and Fix, like the existing ones.
- The table stays in code, with spec R26 and R60 as its source. Changing it is a protected edit (R57).

## Consequences

- No new tools. All the changes are edits to existing files plus two rules. The rejected tools stay rejected for reasons that can be checked: no build step to cache, and no ESLint in the repo.
- The custom resolver is ours to maintain. Adding `tsconfig` `paths`, package `exports` subpaths beyond `testing`, or a new kind of import (for example `require.context` in `.rnstorybook`) means updating `import-layers.ts` and its fixtures. That is ruled out unless the checker learns it first.
- Hoisted keeps phantom dependencies possible in `providers-*` and `apps/*`, which may import any third-party package. A provider could use a library that only another package declares. Until the isolated-install trial, that shows up only as a broken install elsewhere.
- Staying on pnpm 10 forgoes pnpm 11's `strictDepBuilds`. `minimumReleaseAge` closes the main supply-chain gap. pnpm 10 still gets releases (10.34.7 on 12 Oct 2026), but its end of support is not stated anywhere I found.
- Node 24 means developers and CI move off 22. Set `engineStrict: true` in `pnpm-workspace.yaml` so an older Node fails at install with a clear message, rather than only warning.
- Still open: whether isolated installs work for the native build (decided at the first dev-client build), and the pnpm 11 upgrade task.

## Sources

- Expo, Work with monorepos (isolated installs from SDK 54, automatic Metro config from SDK 52, caveats): https://docs.expo.dev/guides/monorepos/
- pnpm 11.0 release notes (`.npmrc` no longer read for non-auth settings, `minimumReleaseAge` 1440, `strictDepBuilds`, Node 22+): https://pnpm.io/ko/blog/releases/11.0
- pnpm 12.0 release notes (Rust rewrite, lockfile compatibility, breaking changes): https://pnpm.io/blog/releases/12.0
- InfoQ, pnpm 11 RC (April 2026): https://infoq.com/news/2026/04/pnpm-11-rc-release/
- Node.js, Modules: TypeScript (type stripping on by default and unflagged in 22.18, stable in 24.12 and 25.2, erasable syntax only): https://nodejs.org/api/typescript.md
- dependency-cruiser: https://github.com/sverweij/dependency-cruiser
- npm registry, checked 2026-10-18: pnpm 10.34.7 (latest-10), 11.28.6 (latest-11), 12.14.0 (latest, 12.0.0 published 2026-08-26); dependency-cruiser 18.6.0; eslint-plugin-boundaries 7.2.0; lefthook 2.2.2
- Repository evidence: `pnpm check` timings and the two `import-layers` probes above, run against /home/claude/grocs at commit 5d99f54; TASK-1.3 implementation notes
