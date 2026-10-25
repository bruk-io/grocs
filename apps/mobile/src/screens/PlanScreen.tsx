import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MealPlanTemplate, Text } from '@grocs/ui';
import { visibleItems, weekIdFor } from '@grocs/core';
import type { Item, Meal } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { household } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';
import { mealTone, weekDays, weekLabelFor } from './week-days.ts';

export interface PlanScreenProps {
  app: App;
  kitchenId: string;
}

/** The week's meals (R5-R8): MealPlanTemplate fed by watchWeekMeals. Household avatars stay sample for now (TASK-27's territory). */
export function PlanScreen({ app, kitchenId }: PlanScreenProps) {
  const go = useGo();
  const [weekOffset, setWeekOffset] = useState(0);
  const viewedAt = app.now() + weekOffset * 7 * 86_400_000;
  const { weekId, days } = weekDays(viewedAt);
  // Items and the toBuy badge stay on the current week, not the one being viewed: GroceriesScreen
  // (where onOpenGroceries lands) always shows app.now()'s week, so this mirrors that, not the nav.
  const currentWeekId = weekIdFor(app.now());
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [items, setItems] = useState<readonly Item[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      app.watchWeekItems(
        kitchenId,
        currentWeekId,
        (next) => setItems(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, currentWeekId],
  );
  const toBuy = visibleItems({ weekId: currentWeekId, items: Object.fromEntries(items.map((i) => [i.id, i])) }).filter((i) => i.state.value !== 'in-cart').length;

  const planDays = days.map((day) => ({
    id: day.dayId,
    weekday: day.weekday,
    day: day.day,
    meals: meals
      .filter((m) => m.dayIndex.value === day.dayIndex)
      .map((m) => ({ id: m.id, name: m.name.value, tone: mealTone(m.id), ...(m.link.value ? { link: m.link.value } : {}) })),
  }));

  return (
    <View style={styles.screen}>
      <MealPlanTemplate
        title={weekOffset === 0 ? 'This week' : 'That week'}
        weekLabel={weekLabelFor(viewedAt)}
        members={household}
        days={planDays}
        toBuy={toBuy}
        onSettings={go.settings}
        onPreviousWeek={() => setWeekOffset((n) => n - 1)}
        onNextWeek={() => setWeekOffset((n) => n + 1)}
        onPlan={(dayId) => go.addMeal(dayId)}
        onOpenMeal={(dayId, mealId) => go.addMeal(dayId, mealId)}
        onOpenGroceries={go.groceries}
      />
      {loadError ? <Text variant="muted">Could not load the plan: {loadError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
