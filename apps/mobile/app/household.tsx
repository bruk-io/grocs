import { useNativeApp } from '../src/app-context.tsx';
import { HouseholdScreen } from '../src/screens/HouseholdScreen.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';

export default function Route() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <HouseholdScreen app={app} kitchenId={kitchenId} />}
    </KitchenGate>
  );
}
