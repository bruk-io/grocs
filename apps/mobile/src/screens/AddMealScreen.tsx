import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MealFormTemplate, Text } from '@grocs/ui';
import type { AddMeal, EditMeal, RemoveMeal } from '@grocs/application';
import type { Meal } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { dayFor, dayLabelFor } from './week-days.ts';

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
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [linkError, setLinkError] = useState<string | undefined>(undefined);
  const [problem, setProblem] = useState<string | undefined>(undefined);
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
    setLinkError(undefined);
    setProblem(undefined);
    setAdding(true);
    try {
      const command: AddMeal | EditMeal = mealId
        ? { type: 'EditMeal', kitchenId, weekId, mealId, name, link: link.trim() === '' ? null : link }
        : { type: 'AddMeal', kitchenId, weekId, dayIndex, name, link: link.trim() === '' ? null : link };
      const result = await app.dispatch(command);
      if (result.ok) {
        go.plan();
        return;
      }
      if (result.error.code === 'invalid-link') setLinkError(result.error.message);
      else setProblem(problemFor(result.error.code, mealId ? 'Could not save that meal' : 'Could not add that meal'));
    } finally {
      setAdding(false);
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

  const banner = problem ?? (loadError ? `Could not load this meal: ${loadError}` : undefined);

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
        onBack={go.plan}
      />
      {banner ? <Text variant="muted">{banner}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
