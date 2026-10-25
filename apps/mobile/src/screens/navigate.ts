import { useRouter } from 'expo-router';

/** The routes the design links between, by name. Navigation only: no logic sits behind them yet. */
export function useGo() {
  const router = useRouter();
  return {
    welcome: () => router.navigate('/'),
    join: () => router.navigate('/join'),
    plan: () => router.navigate('/plan'),
    /** Opens Add/Edit a meal for dayId: with no mealId it plans a new one, with one it edits the meal already there. */
    addMeal: (dayId: string, mealId?: string) => router.navigate({ pathname: '/add-meal', params: { dayId, ...(mealId ? { mealId } : {}) } }),
    groceries: () => router.navigate('/'),
    quickAdd: () => router.navigate('/quick-add'),
    settings: () => router.navigate('/settings'),
  };
}
