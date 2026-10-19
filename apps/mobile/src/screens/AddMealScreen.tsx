import { useState } from 'react';
import { MealFormTemplate } from '@grocs/ui';
import { useGo } from './navigate.ts';

/** Add a meal, with sample data. Back and Add to Thursday lead to Meal plan. */
export function AddMealScreen() {
  const go = useGo();
  const [name, setName] = useState('Fried rice');
  const [link, setLink] = useState('');
  return (
    <MealFormTemplate
      dateLabel="Thursday, Oct 22"
      submitLabel="Add to Thursday"
      name={name}
      onNameChange={setName}
      link={link}
      onLinkChange={setLink}
      onSubmit={go.plan}
      onBack={go.plan}
    />
  );
}
