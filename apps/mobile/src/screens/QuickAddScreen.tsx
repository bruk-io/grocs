import { useEffect, useState } from 'react';
import type { AddItem } from '@grocs/application';
import { weekIdFor } from '@grocs/core';
import { ItemPickerTemplate } from '@grocs/ui';
import { useNativeApp } from '../app-context.tsx';
import { meals, oftenBought, suggestions } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';

/** Add an item to the real grocery list (R10). The meal filter, suggestions and often-bought chips still show sample data (TASK-1.21). */
export function QuickAddScreen() {
  const go = useGo();
  const { app } = useNativeApp();
  const [kitchenId, setKitchenId] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [mealId, setMealId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let current = true;
    app.findMyKitchen().then((id) => current && setKitchenId(id));
    return () => {
      current = false;
    };
  }, [app]);

  const add = async () => {
    if (!kitchenId) return;
    const command: AddItem = { type: 'AddItem', kitchenId, weekId: weekIdFor(app.now()), name: value };
    const result = await app.dispatch(command);
    if (result.ok) go.groceries();
  };

  return (
    <ItemPickerTemplate
      weekLabel="Week of Oct 19"
      value={value}
      onValueChange={setValue}
      meals={meals}
      {...(mealId ? { selectedMealId: mealId } : {})}
      onSelectMeal={setMealId}
      suggestions={suggestions}
      frequent={oftenBought}
      onAdd={() => void add()}
      onBack={go.groceries}
    />
  );
}
