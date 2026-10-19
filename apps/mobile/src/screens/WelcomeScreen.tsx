import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, SignInTemplate, Text } from '@grocs/ui';
import type { DemoAccess, DevAccess } from '../composition/native.ts';
import { useGo } from './navigate.ts';

/**
 * The signed-out screen: the Welcome template, with no sign-in logic yet (Continue with Google and
 * the invite link do nothing). In development builds the seeded test accounts sign in against the
 * Auth emulator from the foot of the sheet (R53).
 */
export function WelcomeScreen({ dev, demo = null }: { dev: DevAccess | null; demo?: DemoAccess | null }) {
  const go = useGo();
  return (
    <View style={styles.screen}>
      <SignInTemplate
        title="Grocs"
        tagline="Plan the week. Shop together."
        onOpenInvite={go.join}
        {...(demo ? { footer: <TryDemo demo={demo} /> } : dev ? { footer: <DevSignIn dev={dev} /> } : {})}
      />
    </View>
  );
}

/** The demo variant's way in: no account, and sample data that stays on the phone (decision-12). */
function TryDemo({ demo }: { demo: DemoAccess }) {
  return <Button variant="text" size="s" label="Try the demo" onPress={() => void demo.signIn()} />;
}

function DevSignIn({ dev }: { dev: DevAccess }) {
  const [problem, setProblem] = useState<string | null>(null);
  return (
    <View style={styles.dev}>
      {dev.accounts.map((account) => (
        <Button
          key={account.email}
          variant="text"
          size="s"
          label={`Sign in as ${account.label} (test)`}
          onPress={() => {
            setProblem(null);
            dev.signIn(account.email, account.password).catch((e: Error) => setProblem(e.message));
          }}
        />
      ))}
      {problem ? <Text variant="muted">{problem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  dev: { alignItems: 'center' },
});
