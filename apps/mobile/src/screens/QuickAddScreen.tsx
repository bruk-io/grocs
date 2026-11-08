import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ItemPickerTemplate, Text } from '@grocs/ui';
import type { AddItem } from '@grocs/application';
import { weekIdFor } from '@grocs/core';
import type { Meal } from '@grocs/core';
import type { App } from '../composition/compose-app.ts';
import { AISLE_OPTIONS, isAisleId } from './aisle-options.ts';
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
  const [amount, setAmount] = useState('');
  const [mealId, setMealId] = useState<string | undefined>(undefined);
  const [aisleId, setAisleId] = useState<string | undefined>(undefined);
  // Set once the person chooses (or clears) an aisle themselves, so a later suggestion never overwrites it (R11).
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
    if (aisleTouched.current) return;
    // Every name change invalidates any lookup still in flight and clears what it would have shown, so a
    // name with nothing remembered (or a blank one) never keeps a now-stale suggestion selected (R11, R14).
    const seq = ++suggestionSeq.current;
    setAisleId(undefined);
    if (value.trim() === '') return;
    app.suggestAisle(kitchenId, value).then((suggested) => {
      if (seq !== suggestionSeq.current || aisleTouched.current) return;
      if (suggested && isAisleId(suggested)) setAisleId(suggested);
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
      // Only the person's own choice is sent; a suggestion applies through AddItem's own memory lookup
      // instead, so it is never re-remembered as if it had been chosen just now (R11, R14).
      ...(aisleTouched.current && aisleId ? { aisle: aisleId } : {}),
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
        // The recipe-suggestion and frequent-items sections are a different feature (TASK-57) with
        // nothing real behind them yet; the picker hides both when empty. Unrelated to the aisle chip above.
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
