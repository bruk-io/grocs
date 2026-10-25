import { useNativeApp } from '../src/app-context.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';
import { PlanScreen } from '../src/screens/PlanScreen.tsx';

export default function Route() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <PlanScreen app={app} kitchenId={kitchenId} />}
    </KitchenGate>
  );
}
