import { useLocalSearchParams } from 'expo-router';
import { useNativeApp } from '../src/app-context.tsx';
import { SampleGroceriesScreen } from '../src/screens/SampleGroceriesScreen.tsx';
import type { SampleGroceriesState } from '../src/screens/SampleGroceriesScreen.tsx';

const STATES: readonly SampleGroceriesState[] = ['groceries', 'offline', 'toast', 'empty', 'allDone'];

/** Development only: /groceries-samples?state=offline, toast, empty or allDone shows the reference's Groceries screens on sample data. Shows nothing in a release build. */
export default function Route() {
  const { isDevBuild } = useNativeApp();
  const { state } = useLocalSearchParams<{ state?: string }>();
  if (!isDevBuild) return null;
  const shown = STATES.find((s) => s === state);
  return <SampleGroceriesScreen {...(shown ? { state: shown } : {})} />;
}
