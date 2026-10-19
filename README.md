# Grocs

A meal plan and grocery list for two people. You plan the week's meals on the days you'll cook them, the list comes together from them, and both of you tick things off from your own phones while you shop. A family of mushrooms lives in the kitchen and keeps you company.

It's also an experiment in handing software work to agents. Almost everything here was built by Claude agents working through my [philosophy plugin](PLACEHOLDER-philosophy-plugin-link) for Claude Code, with me deciding what to build and approving the decisions along the way. The board in [`backlog/`](backlog/) is the full record, and it's meant to be read.

## Try it

- **Android:** download the demo APK from [Releases](https://github.com/bruk-io/grocs/releases) and install it. The demo runs on sample data on your phone, so there's no account and nothing leaves the device.
- **In a browser:** every screen and component is in Storybook at [bruk-io.github.io/grocs](https://bruk-io.github.io/grocs/).

## How the work ran

Every piece of work goes through the same loop. Someone writes down the problem and what finished looks like, the work is sized and split until each piece is predictable, an agent plans and builds it, and a reviewer that didn't do the work decides whether it closes. Anything a script can check is a script. The rest is judgement, and it's written down where the next person, or agent, can find it.

Some places to see that on this board:

- **The intent.** [TASK-1](<backlog/tasks/task-1 - Grocs-a-shared-meal-plan-and-grocery-list-for-the-two-of-us.md>) is the app in my own words, starting from "We use Google Keep for groceries and it's janky."
- **The spec.** [doc-1](<backlog/docs/specs/doc-1 - Spec-Grocs-a-shared-meal-plan-and-grocery-list-for-the-two-of-us.md>) turns the intent into numbered requirements that every task cites, along with the repository layout and the areas where policies conflict.
- **Decisions.** Design questions are answered as decision records, worked out with the agents and approved by me. [decision-3](<backlog/decisions/decision-3 - Agent-workflow-an-orchestrator-and-per-layer-agents-deliver-each-slice.md>) is how the agents themselves are organised: an orchestrator, and a builder, small builder and reviewer for each architectural layer, each with a pinned model and reasoning effort. [decision-11](<backlog/decisions/decision-11 - UI-testing-four-levels-all-driven-by-the-stories.md>) is how the UI is tested.
- **A review that said no.** The first review of [TASK-9](<backlog/tasks/task-9 - Signed-in-home-is-the-Groceries-template-fed-by-the-live-list.md>) refused to close it because no test showed a second person's item appearing on the open screen. The builder added that test and a second review closed it.
- **Follow-ups from findings.** Reviews file what they find as drafts instead of fixing it on the spot. [TASK-1.39](<backlog/tasks/task-1.39 - Name-the-kitchen-scene-colours-by-role-not-by-hex.md>) came out of a review of the design tokens and added a check so the problem can't come back.
- **Bugs the system found in itself.** [TASK-1.41](<backlog/tasks/task-1.41 - Browser-pass-scans-a-mascots-speech-bubble-mid-fade-so-its-contrast-check-fails-at-random.md>) was a contrast check that failed at random on a mascot's speech bubble mid-fade, found the first time baselines were generated on CI. [TASK-1.36](<backlog/tasks/task-1.36 - hooks.test.ts-leaks-GIT_DIR-into-its-git-fixture-corrupting-shared-.git-config-on-every-real-commit.md>) was a hook test that corrupted the repository's own git config whenever it ran inside a real commit.
- **The UI.** [TASK-1.37](<backlog/tasks/task-1.37 - UI-for-every-screen-built-from-the-design-reference-without-logic.md>) turned a design canvas into components and screens, split by design level, with every story checked for accessibility and compared against an approved screenshot.

The machinery that keeps this honest lives in [`tools/`](tools/). The checks in [`tools/checks`](tools/checks/) enforce the import layers, design tokens, story coverage and visual baselines, and each failure says which rule broke and why it exists. The hooks in [`tools/hooks`](tools/hooks/) refuse edits that skip, focus or delete tests. The agent definitions in [`.claude/agents`](.claude/agents/) are generated from a template, and a check fails if one drifts from decision-3.

## Running it locally

You need Node 24, pnpm 10, and Java 21 for the Firebase emulators. No Docker.

```sh
pnpm install
pnpm hooks:install          # the pre-commit hook runs the same checks as CI
pnpm check                  # every check script
pnpm typecheck
pnpm test                   # unit, ui, app and tools tests
pnpm test:emulator          # provider contracts and the two-client test on the Firebase emulators
pnpm emulators              # start the emulators with seed data
pnpm --filter @grocs/ui storybook
```

The workspace layout and the reasons for it are in the spec. [CLAUDE.md](CLAUDE.md) is what the agents read first.

## Licence

[MIT](LICENSE).
