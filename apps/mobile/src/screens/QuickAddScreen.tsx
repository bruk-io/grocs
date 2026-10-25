import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ItemPickerTemplate, Text } from '@grocs/ui';
import type { AddItem } from '@grocs/application';
import { weekIdFor } from '@grocs/core';
import type { Meal } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { oftenBought, suggestions } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';
import { mealTone, weekLabelFor } from './week-days.ts';

export interface QuickAddScreenProps {
  app: App;
  kitchenId: string;
}

/** Add an item to the real grocery list. "For a meal" reads the same watchWeekMeals data as Groceries and Plan (AC4), so the chips never disagree with their badges. */
export function QuickAddScreen({ app, kitchenId }: QuickAddScreenProps) {
  const go = useGo();
  const weekId = useMemo(() => weekIdFor(app.now()), [app]);
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [mealId, setMealId] = useState<string | undefined>(undefined);

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

  const pickerMeals = meals.map((m) => ({ id: m.id, label: m.name.value, tone: mealTone(m.id) }));

  const add = async () => {
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: value };
    const result = await app.dispatch(command);
    if (result.ok) go.groceries();
  };

  return (
    <View style={styles.screen}>
      <ItemPickerTemplate
        weekLabel={weekLabelFor(app.now())}
        value={value}
        onValueChange={setValue}
        meals={pickerMeals}
        {...(mealId ? { selectedMealId: mealId } : {})}
        onSelectMeal={setMealId}
        suggestions={suggestions}
        frequent={oftenBought}
        onAdd={() => void add()}
        onBack={go.groceries}
      />
      {loadError ? <Text variant="muted">Could not load this week's meals: {loadError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
