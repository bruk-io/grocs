import { useEffect, useState } from 'react';
import type { User } from '@grocs/ports';
import { PreferencesTemplate } from '@grocs/ui';
import { useNativeApp } from '../app-context.tsx';
import { useGo } from './navigate.ts';

/**
 * Settings. Sign out ends the session and leads to Welcome; Copy diagnostics puts the header and the
 * on-phone log buffer on the clipboard (R35). The notifications switch is left off and without a handler:
 * push opt-in is TASK-1.29, and the template cannot draw the switch disabled.
 */
export function SettingsScreen() {
  const go = useGo();
  const { app, diagnostics } = useNativeApp();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => app.watchSession(setUser), [app]);

  const signOut = () => {
    // A failed sign-out is logged by the instrumented auth port; the member stays where they are.
    app.signOut().then(go.welcome, () => undefined);
  };
  const copyDiagnostics = () => {
    app.copyText(diagnostics()).catch(() => undefined);
  };

  return (
    <PreferencesTemplate
      name={user?.displayName ?? user?.email ?? 'You'}
      email={user?.email ?? ''}
      kitchen="Our kitchen" // the app has no read of the kitchen's name yet; this is the name every kitchen starts with
      partnerName="your partner"
      notificationsOn={false}
      onBack={go.groceries}
      onCopyDiagnostics={copyDiagnostics}
      onSignOut={signOut}
    />
  );
}
