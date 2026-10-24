import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GoogleSignIn } from '@grocs/ports';
import { Button, SignInTemplate, Text } from '@grocs/ui';
import type { DemoAccess, DevAccess } from '../composition/native.ts';
import { useGo } from './navigate.ts';

/**
 * The signed-out screen: Continue with Google signs in for real (TASK-1.15); the invite link opens
 * the join screen. In development builds the seeded test accounts also sign in against the Auth
 * emulator from the foot of the sheet (R53) - useful where Google's own picker needs Play Services
 * or a signed build Google recognises (a fresh emulator image, says, or CI). A successful sign-in
 * needs no screen-level follow-up: it updates Firebase Auth state, which Home's watchSession already
 * observes.
 */
export function WelcomeScreen({
  signInWithGoogle,
  dev,
  demo = null,
}: {
  signInWithGoogle: GoogleSignIn['signInWithGoogle'];
  dev: DevAccess | null;
  demo?: DemoAccess | null;
}) {
  const go = useGo();
  const [signingIn, setSigningIn] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const onContinue = () => {
    setProblem(null);
    setSigningIn(true);
    signInWithGoogle()
      .catch((e: Error) => setProblem(e.message))
      .finally(() => setSigningIn(false));
  };
  return (
    <View style={styles.screen}>
      <SignInTemplate
        title="Grocs"
        tagline="Plan the week. Shop together."
        {...(demo
          ? { primaryLabel: 'Try the demo', onPrimary: () => void demo.signIn() }
          : {
              onContinue,
              onOpenInvite: go.join,
              signingIn,
              ...(problem || dev
                ? {
                    footer: (
                      <>
                        {problem ? <Text variant="muted">{problem}</Text> : null}
                        {dev ? <DevSignIn dev={dev} /> : null}
                      </>
                    ),
                  }
                : {}),
            })}
      />
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
  dev: { alignItems: 'center' },
});
