---
id: TASK-16
title: >-
  Weakening check asks when a commit edits a check config that is new on its own
  branch
status: In Progress
assignee:
  - '@claude'
created_date: '2026-10-19 19:03'
updated_date: '2026-10-20 07:58'
labels:
  - size-1
  - ci
dependencies: []
modified_files:
  - tools/checks/run.ts
  - tools/checks/run.test.ts
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
During TASK-10.4 the pre-commit weakening check (weakening/loosen-check-config, tools/checks/weakening.ts reviewChange) flagged removing lines from .github/workflows/demo-apk.yml between two commits on apk/demo, though the file does not exist on main. The builder squashed and force-pushed to get past it. Iterating a new workflow (which needs pushes to test) hits this every time. CI's PR-mode review against the base would see a new file and pass, so the pre-commit view is the stricter, wrong one here.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Removing lines from a check config that does not exist on the merge base with main is not a weakening finding in the pre-commit check
- [x] #2 Removing lines from a check config that exists on main still asks (test)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. In tools/checks/run.ts's reviewGitChange, when base === 'staged' and a file isProtected (weakening.ts), resolve the merge-base commit between HEAD and main (git merge-base HEAD main; fall back silently to the old behaviour if that ref cannot be resolved, e.g. no main branch in an isolated test fixture). 2. If the file does not exist at that merge-base commit, treat 'before' as null (same as a brand-new file) regardless of what HEAD holds, so iterating a check config that only exists on the current branch is never judged as removing lines from it. 3. Leave CI mode and non-protected files untouched: CI already diffs against the real base via a three-dot diff, and test-weakening checks must keep comparing against HEAD. 4. Add unit tests in tools/checks/run.test.ts (or wherever its git-backed tests live) covering: a config file new on the branch whose lines shrink across commits does not ask; the same file once it exists on main (merge-base) still asks when lines shrink. 5. Run pnpm check, typecheck, test.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed in tools/checks/run.ts's reviewGitChange: in staged mode, a protected file (weakening.ts's isProtected) now has 'before' taken from the merge-base with main, not bare HEAD, when the file does not exist at that merge-base (falls back to the old HEAD-based before if merge-base can't resolve, e.g. no main in an isolated fixture). CI mode is unchanged (already diffs against the real base with a three-dot diff). Two tests added to tools/hooks/hooks.test.ts: a config file new on its own branch across several commits is never flagged shrinking; the same shrink on a config that exists on main still asks. pnpm check, typecheck and test all pass (1310 tests, up from 1308).

Check `pnpm check && pnpm typecheck && pnpm test && pnpm test:emulator && pnpm check:release && pnpm --filter @grocs/ui build-storybook && pnpm --filter @grocs/ui visual -- --no-build` exited 0

(567 earlier lines omitted)
```text
│  3.21 kB │ gzip:   1.35 kB
│  storybook-static/assets/Chip-lBWvfbTu.js
│  3.25 kB │ gzip:   1.46 kB
│  storybook-static/assets/SignInTemplate.stories-BJ7sbCBj.js
│  3.69 kB │ gzip:   1.53 kB
│  storybook-static/assets/ItemPickerTemplate.stories-84KNSM2C.js
│  4.34 kB │ gzip:   1.52 kB
│  storybook-static/assets/Button.stories-oKuUPhPX.js
│  4.47 kB │ gzip:   1.31 kB
│  storybook-static/assets/PreferencesTemplate.stories-x1S07O_a.js
│  4.55 kB │ gzip:   1.74 kB
│  storybook-static/assets/TextField-BUQ8W6wa.js
│  4.58 kB │ gzip:   1.76 kB
│  storybook-static/assets/ItemRow-DlxtsPQG.js
│  5.19 kB │ gzip:   1.99 kB
│  storybook-static/assets/GroceryListTemplate.stories-CG-L9128.js
│  5.75 kB │ gzip:   1.97 kB
│  storybook-static/assets/Button-HlTd63fv.js
│  6.43 kB │ gzip:   2.04 kB
│  storybook-static/assets/react-BWPDF9mI.js
│  7.87 kB │ gzip:   3.00 kB
│  storybook-static/assets/Mascot-CVO2Zfzk.js
│  11.37 kB │ gzip:   4.20 kB
│  storybook-static/assets/icons-D4zA4yxG.js
│  15.62 kB │ gzip:   2.56 kB
│  storybook-static/assets/KitchenScene-_dK9hVdg.js
│  17.31 kB │ gzip:   4.66 kB
│  storybook-static/vite-inject-mocker-entry.js
│  27.81 kB │ gzip:   9.67 kB
│  storybook-static/assets/module-d75twOs6.js
│  35.63 kB │ gzip:  10.09 kB
│  storybook-static/assets/art-wrpbBZ8J.js
│  167.09 kB │ gzip:  49.83 kB
│  storybook-static/assets/react-18-CZ7Uj1bU.js
│  211.29 kB │ gzip:  66.04 kB
│  storybook-static/assets/iframe-7rNFOYcX.js
│  1,359.38 kB │ gzip: 391.72 kB

│
▲  Vite [plugin builtin:vite-reporter]
│  (!) Some chunks are larger than 500 kB after minification. Consider:
│  - Using dynamic import() to code-split the application
│  - Use build.rolldownOptions.output.codeSplitting to improve chunking:
│  ]8;;https://rolldown.rs/reference/OutputOptions.codeSplittinghttps://rolldown.rs/reference/OutputOptions.codeSplitting]8;;
│  - Adjust chunk size limit for this warning via
│  build.chunkSizeWarningLimit.
│
▲  Vite [33m[SHIMMED_EXPORT] [0mMissing export "TurboModuleRegistry" has been
│  shimmed in module "../../node_modules/react-native-web/dist/index.js".

│  Vite ✓ built in 1.36s
│
◇  Output directory:
│  /Users/brukhabtu/src/github.com/bruk-io/grocs/packages/ui/storybook-static
│
└  Storybook build completed successfully

$ node ../../tools/visual.ts -- --no-build
visual: image comparison skipped on darwin; baselines are compared on Linux only. The axe and 44 x 44 checks still run.
visual: 311 story views checked (axe, 44 x 44, images not compared)
```

Review (philosophy:reviewer, 2026-10-20): verdict NOT CLOSED, on board bookkeeping only; the code change itself is sound. Both acceptance criteria verified independently and ticked. AC#1: the new 'does not ask for a check config that only exists on its own branch' test in tools/hooks/hooks.test.ts shrinks .github/workflows/demo.yml (matched by weakening.ts CHECK_CONFIG) from three run-steps to one across commits on a branch and asserts reviewGitChange(root,'staged') is []; without run.ts's merge-base guard lineDiff would report two non-trivial removed lines and weakening/loosen-check-config would ask, so the assertion is real. AC#2: the companion lefthook.yml test still returns exactly ['weakening/loosen-check-config'], and lefthook.yml exists at the fixture merge-base, so the ask path is proven live rather than disabled. Full tier (pnpm check && typecheck && test && test:emulator && check:release && build-storybook && visual) exited 0 and reformatted nothing: git status before and after was identical apart from this task file going A to AM, which is record-check's own note. Also confirmed the guard cannot regress commits on main itself (merge-base(HEAD,main)==HEAD there, so before was already null in the only case it fires) and cannot affect test-weakening (CHECK_CODE excludes *.test.ts). Blockers, both from board-check close and both for whoever owns the finish line: (1) the task file has never been committed, so the finish line it is judged against is not on record; (2) a bug closes with its repro recorded (record-check --repro, or a note starting 'No repro:') and TASK-16 has neither. Same bookkeeping gap as TASK-15. Non-blocking findings: Low - modified_files lists tools/checks/run.test.ts, which the diff never touches; the tests landed in tools/hooks/hooks.test.ts. Low - the two new tests are order-coupled, the second deleting the branch the first created, so the second cannot run alone; cleanup belongs in afterAll. Note - mergeBase resolves the bare local 'main' ref, so it is only as current as that ref, which matches AC#1's wording and is design. Question for a human - untracked mise.toml is in the tree, named in no criterion and no modified_files entry; decide whether it belongs to this change. No finding earned a draft.
<!-- SECTION:NOTES:END -->
