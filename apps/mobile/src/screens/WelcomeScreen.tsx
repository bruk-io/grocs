import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, SignInTemplate, Text, tokens } from '@grocs/ui';
import type { DevAccess } from '../composition/native.ts';

/**
 * The signed-out screen: the Welcome template, with no sign-in logic yet (Continue with Google and
 * the invite link do nothing). In development builds the seeded test accounts sign in against the
 * Auth emulator from the foot of the sheet (R53).
 */
export function WelcomeScreen({ dev }: { dev: DevAccess | null }) {
  return (
    <View style={styles.screen}>
      <SignInTemplate title="Grocs" tagline="Plan the week. Shop together." />
      {dev ? <DevSignIn dev={dev} /> : null}
    </View>
  );
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
  dev: { position: 'absolute', left: 0, right: 0, bottom: tokens.space[16], alignItems: 'center' },
});
