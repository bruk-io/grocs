---
id: DRAFT-2
title: >-
  Node 24 is only pinned by an untracked mise.toml, so pnpm refuses to run on a
  fresh clone
status: Draft
assignee: []
created_date: '2026-10-19 04:28'
updated_date: '2026-10-19 04:30'
labels:
  - size-1
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
decision-6/TASK-3 raised engines.node to >=24.12, but nothing checked in pins a local toolchain: the only Node 24 pin on this machine is mise.toml, which is untracked (git status shows '?? mise.toml'). On a system Node 22 every pnpm script fails immediately with 'Your Node version is incompatible ... Expected version: >=24.12, Got: v22.21.1', so all checks have to be run as 'mise exec -- pnpm ...'. Found while reviewing TASK-6, unrelated to its change.

Acceptance criteria to set on promotion:
- A fresh clone can run pnpm check without a per-developer, untracked toolchain file (check mise.toml in, or add .node-version/.nvmrc), and the workspace docs say how to get Node 24.
<!-- SECTION:DESCRIPTION:END -->

## Comments

<!-- COMMENTS:BEGIN -->
author: @claude
created: 2026-10-19 04:30

---

Orchestrator correction (2026-10-19): TASK-3 already committed a root .node-version file ('24'), which mise and most other version managers (nvm, fnm, asdf) read automatically on a fresh clone without any untracked per-developer file. Verified directly: 'mise current node' in a fresh scratch directory containing only a bare .node-version='24' resolves to 24.13.0 with no other config present. The premise here (nothing checked in pins Node 24) no longer holds now that .node-version is committed. Archiving rather than promoting.

---
<!-- COMMENTS:END -->
