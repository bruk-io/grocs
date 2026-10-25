import { useNativeApp } from '../src/app-context.tsx';
import { GroceriesScreen } from '../src/screens/GroceriesScreen.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';

export default function Home() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <GroceriesScreen app={app} kitchenId={kitchenId} />}
    </KitchenGate>
  );
}
