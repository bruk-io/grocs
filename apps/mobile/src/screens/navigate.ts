import { useRouter } from 'expo-router';

/** The routes the design links between, by name. Navigation only: no logic sits behind them yet. */
export function useGo() {
  const router = useRouter();
  return {
    welcome: () => router.navigate('/'),
    join: () => router.navigate('/join'),
    plan: () => router.navigate('/plan'),
    addMeal: () => router.navigate('/add-meal'),
    groceries: () => router.navigate('/'),
    quickAdd: () => router.navigate('/quick-add'),
    settings: () => router.navigate('/settings'),
  };
}
