import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, tokens } from '@grocs/ui';
import type { DevAccess } from '../composition/native.ts';

/**
 * Signing in with Google is the real flow and is a later task. In development builds the seeded
 * test accounts sign in against the Auth emulator (R53).
 */
export function SignInScreen({ dev }: { dev: DevAccess | null }) {
  const [problem, setProblem] = useState<string | null>(null);
  return (
    <View style={{ flex: 1, padding: tokens.space[4], gap: tokens.space[3], backgroundColor: tokens.color.surface, justifyContent: 'center' }}>
      <Text variant="title">Grocs</Text>
      {dev ? (
        dev.accounts.map((account) => (
          <Button
            key={account.email}
            label={`Sign in as ${account.label} (test)`}
            onPress={() => {
              setProblem(null);
              dev.signIn(account.email, account.password).catch((e: Error) => setProblem(e.message));
            }}
          />
        ))
      ) : (
        <Text variant="muted">Sign in with Google is not built yet</Text>
      )}
      {problem ? <Text variant="muted">{problem}</Text> : null}
    </View>
  );
}
