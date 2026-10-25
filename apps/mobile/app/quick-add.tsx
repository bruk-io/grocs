import { useNativeApp } from '../src/app-context.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';
import { QuickAddScreen } from '../src/screens/QuickAddScreen.tsx';

export default function Route() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <QuickAddScreen app={app} kitchenId={kitchenId} />}
    </KitchenGate>
  );
}
