import { useState } from 'react';
import { PreferencesTemplate } from '@grocs/ui';
import { useGo } from './navigate.ts';

/** Settings, with sample data. Back leads to Groceries and Sign out to Welcome. */
export function SettingsScreen() {
  const go = useGo();
  const [on, setOn] = useState(false);
  return (
    <PreferencesTemplate
      name="Bruk"
      email="you@example.com"
      kitchen="Our kitchen"
      partnerName="Shazya"
      notificationsOn={on}
      onNotificationsChange={setOn}
      onBack={go.groceries}
      onSignOut={go.welcome}
    />
  );
}
