import { useLocalSearchParams } from 'expo-router';
import { useNativeApp } from '../src/app-context.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';
import { RecipeScreen } from '../src/screens/RecipeScreen.tsx';
import { dayFor } from '../src/screens/week-days.ts';

export default function Route() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  const { dayId, mealId } = useLocalSearchParams<{ dayId?: string; mealId?: string }>();
  if (!dayId || !mealId || dayFor(dayId) === null) return null;
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <RecipeScreen app={app} kitchenId={kitchenId} dayId={dayId} mealId={mealId} />}
    </KitchenGate>
  );
}
