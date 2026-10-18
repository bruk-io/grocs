---
id: DRAFT-2
title: >-
  Apply decision-6: move pnpm settings out of .npmrc, Node 24, Metro and
  import-layer rules
status: Draft
assignee: []
created_date: '2026-10-18 22:09'
labels: []
dependencies: []
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-6 (accepted, D3/TASK-1.8) mandates concrete repository changes, and no task on the board owns any of them (checked by title scan and by grepping backlog/tasks and backlog/drafts for npmrc, nodeLinker, erasableSyntax, no-self-barrel, unknown-ui-folder: no hits).

The realistic failure the decision itself names: the hoisted linker is configured in .npmrc, and pnpm 11 no longer reads non-auth settings from .npmrc. A pnpm major bump would silently drop nodeLinker: hoisted and the install would quietly become isolated, with no warning, breaking native modules that are unproven under isolated installs.

Also unowned from the same decision: the Node 24 move, the Metro cleanup, and the two new import-layer rules that close the R60 gaps the decision's probes found (a molecule reaching an organism through the ui barrel is reported as the wrong rule; an atom can climb a level through packages/ui/src/platform, which is in no level table). The decision's 'Still open' section also assumes a separate pnpm 11 upgrade task exists; it does not.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every setting lives in pnpm-workspace.yaml (nodeLinker: hoisted with the corrected reason, autoInstallPeers, minimumReleaseAge: 1440, engineStrict) and .npmrc is deleted; after pnpm install --frozen-lockfile, node_modules/react-native is a real directory and pnpm check:release passes
- [ ] #2 Node 24 everywhere: packageManager pinned to pnpm@10.34.7, engines.node >=24.12, a root .node-version of 24, node-version: 24 in every CI job, erasableSyntaxOnly: true in tsconfig, and no --disable-warning=ExperimentalWarning left in scripts, hooks or .claude/settings.json
- [ ] #3 apps/mobile/metro.config.cjs sets no watchFolders or resolver.nodeModulesPaths, or keeps them with the failing error noted beside them
- [ ] #4 import-layers.ts carries the full packages/ui/src folder table plus rules import-layers/unknown-ui-folder and import-layers/no-self-barrel, with fixture tests asserting each rule id, Why and Fix
- [ ] #5 A separate size-1 task exists for the pnpm 11 upgrade
<!-- AC:END -->
