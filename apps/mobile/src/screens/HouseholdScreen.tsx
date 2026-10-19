import { useState } from 'react';
import { KitchenSetupTemplate } from '@grocs/ui';
import { useGo } from './navigate.ts';

/** Your kitchen, with sample data: waiting for the partner. Start planning leads to Meal plan. */
export function HouseholdScreen() {
  const go = useGo();
  const [name, setName] = useState('Our kitchen');
  return (
    <KitchenSetupTemplate
      email="you@example.com"
      kitchenName={name}
      onKitchenNameChange={setName}
      inviteCode="MOREL-24"
      inviteStatus={{ kind: 'waiting', message: 'Waiting for Shazya to join' }}
      onStart={go.plan}
    />
  );
}
