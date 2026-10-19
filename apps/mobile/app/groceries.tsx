import { useLocalSearchParams } from 'expo-router';
import { GroceriesScreen } from '../src/screens/GroceriesScreen.tsx';
import type { GroceriesState } from '../src/screens/GroceriesScreen.tsx';

const STATES: readonly GroceriesState[] = ['groceries', 'offline', 'toast', 'empty', 'allDone'];

/** /groceries shows the list; ?state=offline, toast, empty or allDone shows the reference's other Groceries screens. */
export default function Route() {
  const { state } = useLocalSearchParams<{ state?: string }>();
  const shown = STATES.find((s) => s === state);
  return <GroceriesScreen {...(shown ? { state: shown } : {})} />;
}
