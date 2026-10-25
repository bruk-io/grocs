import { useLocalSearchParams } from 'expo-router';
import { useNativeApp } from '../src/app-context.tsx';
import { AddMealScreen } from '../src/screens/AddMealScreen.tsx';
import { KitchenGate } from '../src/screens/KitchenGate.tsx';
import { dayFor } from '../src/screens/week-days.ts';

export default function Route() {
  const { app, demo, signInWithGoogle } = useNativeApp();
  const { dayId, mealId } = useLocalSearchParams<{ dayId?: string; mealId?: string }>();
  if (!dayId || dayFor(dayId) === null) return null;
  return (
    <KitchenGate app={app} demo={demo} signInWithGoogle={signInWithGoogle}>
      {(kitchenId) => <AddMealScreen app={app} kitchenId={kitchenId} dayId={dayId} {...(mealId ? { mealId } : {})} />}
    </KitchenGate>
  );
}
