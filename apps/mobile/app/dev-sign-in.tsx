import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from '@grocs/ui';
import { useNativeApp } from '../src/app-context.tsx';

/**
 * Development only: grocs://dev-sign-in?as=alex (or sam) signs that seed account in to the Auth emulator
 * and opens the app, so the end-to-end flows can sign in without a Google account (TASK-62, R51). There is
 * no button for it. A release build, or a development build on live Firebase, has no devSignIn and just
 * goes home.
 */
export default function Route() {
  const { devSignIn } = useNativeApp();
  const { as } = useLocalSearchParams<{ as?: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!devSignIn || !as) return;
    devSignIn(as).then(
      () => router.replace('/'),
      (e: Error) => setProblem(e.message),
    );
  }, [devSignIn, as, router]);

  if (!devSignIn) return <Redirect href="/" />;
  if (!as) return <Text variant="muted">Add ?as=alex or ?as=sam to sign in a seed account.</Text>;
  return problem ? <Text variant="muted">{problem}</Text> : null;
}
