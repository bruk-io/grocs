import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MealPlanTemplate, Text } from '@grocs/ui';
import { visibleItems } from '@grocs/core';
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
  const { weekId, days } = weekDays(app.now());
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
        weekId,
        (next) => setItems(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );
  const toBuy = visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) }).filter((i) => i.state.value !== 'in-cart').length;

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
        weekLabel={weekLabelFor(app.now())}
        members={household}
        days={planDays}
        toBuy={toBuy}
        onSettings={go.settings}
        onPlan={(dayId) => go.addMeal(dayId)}
        onOpenMeal={(dayId, mealId) => go.addMeal(dayId, mealId)}
        onOpenGroceries={go.groceries}
      />
      {loadError ? <Text variant="muted">Could not load the plan: {loadError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
