import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MealFormTemplate, Text } from '@grocs/ui';
import type { AddItem, AddMeal, EditMeal, ImportRecipe, MealAdded, RecipeImported, RemoveMeal } from '@grocs/application';
import { recipeForLink } from '@grocs/core';
import type { Meal, Recipe } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { dayFor, dayLabelFor } from './week-days.ts';

/** §17's error table (contract TASK-74): keyed by RecipeImportError or 'recipe-deleted'. Anything
 * else an ImportRecipe/AddItem dispatch can return ('not-signed-in', 'meal-not-found', 'internal',
 * or an AddItem failure mid fan-out, AC#6) falls to the 'other' message. */
const RECIPE_IMPORT_MESSAGES: Readonly<Record<string, string>> = {
  'invalid-url': "That doesn't look like a web link.",
  'not-found': "That page doesn't exist any more.",
  blocked: "That site needs a login or blocked us, so we can't read it.",
  unreachable: "We couldn't reach that site. Try again tomorrow.",
  'not-a-recipe': "We couldn't find a recipe on that page.",
  'incomplete-recipe': 'That recipe is missing its ingredients or steps.',
  'recipe-deleted': 'That recipe was removed from this kitchen.',
};

function importProblemFor(code: string): string {
  return RECIPE_IMPORT_MESSAGES[code] ?? 'Something went wrong importing that recipe.';
}

export interface AddMealScreenProps {
  app: App;
  kitchenId: string;
  /** The day being planned, from the route (every entry point - "Plan" on a day, or tapping a meal already on one - knows its day). The route itself rejects a dayId that is not a real date. */
  dayId: string;
  /** Present when opened to edit a meal that is already on dayId. Absent, this plans a new one. */
  mealId?: string;
}

/** The message for a failed AddMeal/EditMeal/RemoveMeal, mirroring GroceriesScreen's problem banner (R6). */
function problemFor(code: string, fallback: string): string {
  switch (code) {
    case 'empty-name':
      return 'Type what you’re making first';
    case 'meal-not-found':
      return 'That meal is no longer on the plan';
    case 'invalid-day':
      return 'That day is not on the week. Go back and try again.';
    case 'not-signed-in':
      return 'You need to be signed in to do that.';
    default:
      return fallback;
  }
}

/** Add or edit a meal (R5-R8): MealFormTemplate fed by watchWeekMeals, dispatching AddMeal, EditMeal or RemoveMeal. */
export function AddMealScreen({ app, kitchenId, dayId, mealId }: AddMealScreenProps) {
  const go = useGo();
  // The route already rejects a dayId that fails to parse; the fallback here is never acted on
  // (nothing dispatches before the render-null below), only kept so every hook below still runs
  // in the same order on every render, parsed or not.
  const parsed = dayFor(dayId);
  const weekId = parsed?.weekId ?? '';
  const dayIndex = parsed?.dayIndex ?? 0;
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [recipes, setRecipes] = useState<readonly Recipe[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipesLoadError, setRecipesLoadError] = useState<string | null>(null);
  const editing = mealId ? meals.find((m) => m.id === mealId) : undefined;

  useEffect(
    () =>
      app.watchWeekMeals(
        kitchenId,
        weekId,
        (next) => setMeals(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );

  useEffect(
    () =>
      app.watchKitchenRecipes(
        kitchenId,
        (next) => setRecipes(next),
        (error) => setRecipesLoadError(error.message),
      ),
    [app, kitchenId],
  );

  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [linkError, setLinkError] = useState<string | undefined>(undefined);
  const [problem, setProblem] = useState<string | undefined>(undefined);
  // Set once this screen itself creates a new meal (AddMeal's mealId), so an import retry or a
  // later Save edits that meal instead of creating a second one (§17 step 2).
  const [createdMealId, setCreatedMealId] = useState<string | undefined>(undefined);
  const activeMealId = mealId ?? createdMealId;
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | undefined>(undefined);
  // Prefills once, the moment the edited meal's data first arrives; never again, so typing is
  // never clobbered by a later watchWeekMeals notification (including the save this screen itself makes).
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (editing && !prefilled) {
      setName(editing.name.value);
      setLink(editing.link.value ?? '');
      setPrefilled(true);
    }
  }, [editing, prefilled]);

  const submit = async () => {
    // An import in flight already holds this meal's save (AddMeal/EditMeal then ImportRecipe);
    // a Save tapped in that window must not race it into a second AddMeal (§17 step 2).
    if (importing) return;
    setLinkError(undefined);
    setProblem(undefined);
    setAdding(true);
    try {
      const command: AddMeal | EditMeal = activeMealId
        ? { type: 'EditMeal', kitchenId, weekId, mealId: activeMealId, name, link: link.trim() === '' ? null : link }
        : { type: 'AddMeal', kitchenId, weekId, dayIndex, name, link: link.trim() === '' ? null : link };
      const result = await app.dispatch(command);
      if (result.ok) {
        go.plan();
        return;
      }
      if (result.error.code === 'invalid-link') setLinkError(result.error.message);
      else setProblem(problemFor(result.error.code, activeMealId ? 'Could not save that meal' : 'Could not add that meal'));
    } finally {
      setAdding(false);
    }
  };

  const importRecipe = async () => {
    setLinkError(undefined);
    setProblem(undefined);
    setImportError(undefined);
    if (name.trim() === '') {
      setProblem(problemFor('empty-name', 'Could not add that meal'));
      return;
    }
    const trimmedLink = link.trim();
    setImporting(true);
    try {
      let importMealId = activeMealId;
      if (importMealId === undefined) {
        const added: AddMeal = { type: 'AddMeal', kitchenId, weekId, dayIndex, name, link: trimmedLink };
        const result = await app.dispatch(added);
        if (!result.ok) {
          if (result.error.code === 'invalid-link') setLinkError(result.error.message);
          else setProblem(problemFor(result.error.code, 'Could not add that meal'));
          return;
        }
        const mealAdded = result.value.find((e): e is MealAdded => e.type === 'MealAdded');
        if (mealAdded === undefined) {
          setProblem(problemFor('other', 'Could not add that meal'));
          return;
        }
        importMealId = mealAdded.mealId;
        setCreatedMealId(importMealId);
      } else {
        const edited: EditMeal = { type: 'EditMeal', kitchenId, weekId, mealId: importMealId, name, link: trimmedLink };
        const result = await app.dispatch(edited);
        if (!result.ok) {
          if (result.error.code === 'invalid-link') setLinkError(result.error.message);
          else setProblem(problemFor(result.error.code, 'Could not save that meal'));
          return;
        }
      }

      const command: ImportRecipe = { type: 'ImportRecipe', kitchenId, weekId, mealId: importMealId, url: trimmedLink };
      const result = await app.dispatch(command);
      if (!result.ok) {
        setImportError(importProblemFor(result.error.code));
        return;
      }
      const event = result.value.find((e): e is RecipeImported => e.type === 'RecipeImported');
      if (event === undefined) {
        setImportError(importProblemFor('other'));
        return;
      }
      setLink(event.sourceUrl);

      for (const line of event.groceries) {
        const addItem: AddItem = {
          type: 'AddItem',
          kitchenId,
          weekId: event.weekId,
          name: line.name,
          ...(line.amount !== null ? { amount: line.amount } : {}),
          mealId: event.mealId,
        };
        const added = await app.dispatch(addItem);
        if (!added.ok) {
          // AC#6, known behaviour: an AddItem failure stops the fan-out loop here; the groceries
          // already added stay, the recipe and meal link stay relinked, only the message tells a
          // partial import happened.
          setImportError(importProblemFor('other'));
          return;
        }
      }

      go.recipe(dayId, event.mealId);
    } finally {
      setImporting(false);
    }
  };

  const remove = async () => {
    if (!mealId) return;
    setProblem(undefined);
    setRemoving(true);
    try {
      const command: RemoveMeal = { type: 'RemoveMeal', kitchenId, weekId, mealId };
      const result = await app.dispatch(command);
      if (result.ok) {
        go.plan();
        return;
      }
      setProblem(problemFor(result.error.code, 'Could not remove that meal'));
    } finally {
      setRemoving(false);
    }
  };

  if (!parsed) return null;

  const banner =
    problem ??
    (loadError ? `Could not load this meal: ${loadError}` : undefined) ??
    (recipesLoadError ? `Could not load this kitchen's recipes: ${recipesLoadError}` : undefined);
  // "View recipe" (AC#5) only ever reads local data (watchKitchenRecipes + recipeForLink); it is
  // offered only once a concrete meal id exists to navigate to, matching the currently edited
  // link field so it follows a pasted link to an already-saved recipe before any import happens.
  const savedRecipe = recipeForLink(recipes, link.trim() === '' ? null : link.trim());

  return (
    <View style={styles.screen}>
      <MealFormTemplate
        dateLabel={dayLabelFor(dayId)}
        title={mealId ? 'Edit a meal' : 'Add a meal'}
        submitLabel={mealId ? 'Save' : `Add to ${dayLabelFor(dayId).split(',')[0]}`}
        submittingLabel={mealId ? 'Saving' : 'Adding'}
        name={name}
        onNameChange={setName}
        link={link}
        onLinkChange={setLink}
        onSubmit={() => void submit()}
        adding={adding}
        {...(mealId ? { onRemove: () => void remove() } : {})}
        removing={removing}
        {...(linkError ? { linkError } : {})}
        {...(link.trim() !== '' ? { onImportRecipe: () => void importRecipe() } : {})}
        importing={importing}
        {...(importError ? { importError } : {})}
        {...(activeMealId && savedRecipe ? { recipeTitle: savedRecipe.title, onOpenRecipe: () => go.recipe(dayId, activeMealId) } : {})}
        onBack={go.plan}
      />
      {banner ? <Text variant="muted">{banner}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
