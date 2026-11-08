import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ItemPickerTemplate, Text } from '@grocs/ui';
import type { AisleOption } from '@grocs/ui';
import type { AddItem } from '@grocs/application';
import { AISLES, weekIdFor } from '@grocs/core';
import type { Meal } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { mealTone, weekLabelFor } from './week-days.ts';

export interface QuickAddScreenProps {
  app: App;
  kitchenId: string;
}

const AISLE_OPTIONS: readonly AisleOption[] = AISLES.map((a) => ({ id: a.id, label: a.label }));

/** Add an item to the real grocery list. "For a meal" reads the same watchWeekMeals data as Groceries and Plan (AC4), so the chips never disagree with their badges. */
export function QuickAddScreen({ app, kitchenId }: QuickAddScreenProps) {
  const go = useGo();
  const weekId = useMemo(() => weekIdFor(app.now()), [app]);
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [amount, setAmount] = useState('');
  const [mealId, setMealId] = useState<string | undefined>(undefined);
  const [aisleId, setAisleId] = useState<string | undefined>(undefined);
  // Set once the person chooses (or clears) an aisle themselves, so a later suggestion never overwrites it (R14).
  const aisleTouched = useRef(false);
  // Guards a suggestAisle answer that comes back after a newer name's has already landed or the person has chosen.
  const suggestionSeq = useRef(0);

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

  useEffect(() => {
    if (aisleTouched.current || value.trim() === '') return;
    const seq = ++suggestionSeq.current;
    app.suggestAisle(kitchenId, value).then((suggested) => {
      // Stale if a newer name's lookup has started, or the person chose one while this was in flight.
      if (seq !== suggestionSeq.current || aisleTouched.current) return;
      if (suggested) setAisleId(suggested);
    });
  }, [app, kitchenId, value]);

  const pickerMeals = meals.map((m) => ({ id: m.id, label: m.name.value, tone: mealTone(m.id) }));

  const add = async () => {
    const command: AddItem = {
      type: 'AddItem',
      kitchenId,
      weekId,
      name: value,
      ...(amount.trim() !== '' ? { amount } : {}),
      ...(aisleId ? { aisle: aisleId } : {}),
      ...(mealId ? { mealId } : {}),
    };
    const result = await app.dispatch(command);
    if (result.ok) go.groceries();
  };

  return (
    <View style={styles.screen}>
      <ItemPickerTemplate
        weekLabel={weekLabelFor(app.now())}
        value={value}
        onValueChange={setValue}
        amountValue={amount}
        onAmountChange={setAmount}
        meals={pickerMeals}
        {...(mealId ? { selectedMealId: mealId } : {})}
        onSelectMeal={setMealId}
        aisleOptions={AISLE_OPTIONS}
        {...(aisleId ? { selectedAisleId: aisleId } : {})}
        onSelectAisle={(id) => {
          aisleTouched.current = true;
          setAisleId(id);
        }}
        // No suggestions yet: there is nothing real to suggest from (TASK-57). The picker hides both sections when empty.
        suggestions={[]}
        frequent={[]}
        onAdd={() => void add()}
        onBack={go.groceries}
      />
      {loadError ? <Text variant="muted">Could not load this week's meals: {loadError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
