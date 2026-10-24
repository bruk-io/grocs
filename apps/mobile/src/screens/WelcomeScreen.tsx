import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GoogleSignIn } from '@grocs/ports';
import { SignInTemplate, Text } from '@grocs/ui';
import type { DemoAccess } from '../composition/native.ts';
import { useGo } from './navigate.ts';

/**
 * The signed-out screen: Continue with Google signs in for real (TASK-1.15); the invite link opens
 * the join screen. The same flow in every build, dev and release alike - no test sign-in, by design.
 * A successful sign-in needs no screen-level follow-up: it updates Firebase Auth state, which Home's
 * watchSession already observes.
 */
export function WelcomeScreen({
  signInWithGoogle,
  demo = null,
}: {
  signInWithGoogle: GoogleSignIn['signInWithGoogle'];
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
              ...(problem ? { footer: <Text variant="muted">{problem}</Text> } : {}),
            })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
