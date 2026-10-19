import { useState } from 'react';
import { ItemPickerTemplate } from '@grocs/ui';
import { meals, oftenBought, suggestions } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';

/** Add an item, with sample data. Back leads to Groceries. */
export function QuickAddScreen() {
  const go = useGo();
  const [value, setValue] = useState('egg');
  const [mealId, setMealId] = useState<string | undefined>(undefined);
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
      onBack={go.groceries}
    />
  );
}
