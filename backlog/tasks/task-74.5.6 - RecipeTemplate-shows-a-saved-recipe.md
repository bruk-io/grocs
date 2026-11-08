---
id: TASK-74.5.6
title: RecipeTemplate shows a saved recipe
status: Done
assignee:
  - '@claude'
created_date: '2026-11-07 02:27'
updated_date: '2026-11-07 03:48'
labels:
  - size-3
  - layer-ui
dependencies: []
parent_task_id: TASK-74.5
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Contract §16. A presentational template for a saved recipe: title, yield, source host, ingredient lines as written, and numbered steps. It has no servings stepper and no ticking (decision-16: no scaling). orch-retire-recipe-board removes the stale RecipeImport board, so no naming workaround is needed. It depends on no port, so it starts before the ports contract is reviewed (a recorded deviation). Visual baselines come from orch-visual-baselines. Covers TASK-74.5 AC#1 (seeing the title, ingredients, steps and yield).

Split key: ui-recipe-template. Layer: ui. Contract: TASK-74's plan.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 templates/RecipeTemplate.tsx exports RecipeTemplateProps and RECIPETEMPLATE_STATES = ['rest','noYield','long'], with a story for each state
- [x] #2 Any new atoms, molecules or organisms satisfy story-coverage (STATES list, a story per state, interactive states where required)
- [x] #3 RecipeTemplate.behaviour.test.tsx drives onBack through composeStories and userEvent
- [x] #4 Level-1 story and accessibility tests pass. At this commit, pnpm -s typecheck passes repo-wide and vitest --project ui passes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### Order of work
1. Compose RecipeTemplate.tsx from layouts/TaskLayout, layouts/Card, organisms/SubHeader and atoms/Text only; no new atoms/molecules/organisms needed, per contract §16.
2. SubHeader lead is 'back' labelled 'Meal plan' (consistent with MealFormTemplate, the other meal-adjacent template), tag = yieldLabel when present (left out otherwise), mascot 'chanty'. Content: a muted "From {sourceLabel}" line, a Card listing ingredient lines as written, a Card listing numbered steps.
3. RECIPETEMPLATE_STATES = ['rest','noYield','long']; stories for each plus RecipeTemplate.stories.tsx; RecipeTemplate.behaviour.test.tsx drives onBack via composeStories + userEvent and checks the rest/noYield content.
4. Export RecipeTemplate/RecipeTemplateProps from packages/ui/src/index.ts.

### Risks
No port or other-layer dependency; followed TASK-74's slice contract §16 literally (field names, states). The only judgment calls contract left open (back label, mascot, section layout) are recorded above rather than raised as a contract-change request, since the contract explicitly leaves UI composition to this task ("Compose from TaskLayout, SubHeader and existing atoms").

### Proof
- AC#1: RecipeTemplateProps + RECIPETEMPLATE_STATES = ['rest','noYield','long'] exported; Rest/NoYield/Long stories in RecipeTemplate.stories.tsx.
- AC#2: no new atoms/molecules/organisms added, so nothing new for story-coverage to check beyond RecipeTemplate itself, which story-coverage passes (see check output in notes).
- AC#3: RecipeTemplate.behaviour.test.tsx 'goes back to Meal plan' test drives onBack through composeStories/userEvent.
- AC#4: pnpm -s typecheck and vitest --project ui pass repo-wide; output pasted into notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: packages/ui/src/templates/RecipeTemplate.tsx composes layouts/TaskLayout, layouts/Card, organisms/SubHeader and atoms/Text (no new atoms/molecules/organisms). Exports RecipeTemplateProps and RECIPETEMPLATE_STATES = ['rest','noYield','long'], exported from packages/ui/src/index.ts. SubHeader back label 'Meal plan' (as MealFormTemplate uses), mascot 'chanty'; tag = yieldLabel when present. RecipeTemplate.stories.tsx has Rest/NoYield/Long stories. RecipeTemplate.behaviour.test.tsx drives onBack through composeStories + userEvent and checks title/yield/source/ingredients/numbered steps render.

Check output:
- `pnpm -s typecheck` (repo-wide): `$ tsc --noEmit` with no errors.
- `pnpm exec vitest run --project ui`: `Test Files  53 passed (53)` / `Tests  974 passed (974)`.
- `node tools/checks/run.ts --mode staged` (with the new/changed files staged, includes story-coverage, import-layer and the rest of the 16 checks): `checks passed (16 checks, staged mode, 578 ms)`.

Per-story proof of AC#4's "Level-1 story and accessibility tests", named rather than inferred from the aggregate count (`vitest run --project ui --reporter=verbose 2>&1 | grep -i recipetemplate`):

stories.test.tsx (level-1: every story renders) has one passing case per declared state:
 ✓ ./templates/RecipeTemplate.stories.tsx > Rest
 ✓ ./templates/RecipeTemplate.stories.tsx > NoYield
 ✓ ./templates/RecipeTemplate.stories.tsx > Long

stories.accessibility.test.tsx (R42: contrast + touch targets) likewise has one passing case per state:
 ✓ ./templates/RecipeTemplate.stories.tsx > Rest: text is 4.5:1 and targets are 44 x 44
 ✓ ./templates/RecipeTemplate.stories.tsx > NoYield: text is 4.5:1 and targets are 44 x 44
 ✓ ./templates/RecipeTemplate.stories.tsx > Long: text is 4.5:1 and targets are 44 x 44

Plus the three RecipeTemplate.behaviour.test.tsx cases, all passing.

Review (philosophy:reviewer): closed. AC1: RecipeTemplateProps and RECIPETEMPLATE_STATES=['rest','noYield','long'] exported, Rest/NoYield/Long stories present, exported from index.ts. AC2: no new atoms/molecules/organisms (commit ccb8ee4 touches only the template, its story, its behaviour test and index.ts); pnpm check (16 checks incl. story-coverage) passed on merged main 6b10c7c. AC3: behaviour test drives onBack via composeStories+userEvent; re-run here, 3/3 pass. AC4: orchestrator's run on 6b10c7c: typecheck clean, pnpm test 2018 passed; per-story level-1 and accessibility cases named in notes. Emulator failures are in recipe-importer (TASK-74.4.7/74.5.9), unrelated to this UI leaf. No findings; visual baselines are TASK-74.5.8.
<!-- SECTION:NOTES:END -->
