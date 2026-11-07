import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import type { User } from '@grocs/ports';
import { PreferencesTemplate } from '@grocs/ui';
import { useNativeApp } from '../app-context.tsx';
import { useGo } from './navigate.ts';
import { partnerNameOf, useMyKitchenInfo } from './use-kitchen-info.ts';

/**
 * Settings. Sign out ends the session and leads to Welcome; Copy diagnostics puts the header and the
 * on-phone log buffer on the clipboard (R35). The notifications switch is drawn off and disabled with the
 * reason "Coming soon" until push opt-in (TASK-1.29) wires the real toggle.
 */
export function SettingsScreen() {
  const go = useGo();
  const { app, diagnostics } = useNativeApp();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => app.watchSession(setUser), [app]);
  const kitchen = useMyKitchenInfo(app);
  const fromPlan = useLocalSearchParams<{ from?: string }>().from === 'plan';
  const [copied, setCopied] = useState(false);

  const signOut = () => {
    // A failed sign-out is logged by the instrumented auth port; the member stays where they are.
    app.signOut().then(go.welcome, () => undefined);
  };
  const copyDiagnostics = () => {
    app.copyText(diagnostics()).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <PreferencesTemplate
      name={user?.displayName ?? user?.email ?? 'You'}
      email={user?.email ?? ''}
      kitchen={kitchen?.name ?? ''}
      partnerName={partnerNameOf(kitchen) ?? 'your partner'}
      notificationsUnavailable="Coming soon" // push opt-in is TASK-1.29, which wires the real toggle
      {...(fromPlan ? { backLabel: 'Meal plan', onBack: go.plan } : { onBack: go.groceries })}
      onCopyDiagnostics={copyDiagnostics}
      diagnosticsCopied={copied}
      onOpenHousehold={go.household}
      onSignOut={signOut}
    />
  );
}
