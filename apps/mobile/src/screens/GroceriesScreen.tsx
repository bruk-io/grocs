import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type { AddItem, ClearCart, SetItemState } from '@grocs/application';
import { visibleItems, weekIdFor } from '@grocs/core';
import type { Item, Meal } from '@grocs/core';
import { GroceryListTemplate } from '@grocs/ui';
import type { ListItem } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { mealTone, todayId, weekDays, weekLabelFor } from './week-days.ts';

export interface GroceriesScreenProps {
  app: App;
  kitchenId: string;
}

/** The inner layout applies from here up (decision-14: the medium width class), by window width, not by device. */
export const INNER_MIN_WIDTH = 600;

const toListItem = (item: Item, weekMeals: readonly { id: string; name: string; tone: ReturnType<typeof mealTone> }[]): ListItem => {
  const mealBadges = weekMeals.filter((meal) => item.badges.includes(meal.id)).map((meal) => ({ label: meal.name, tone: meal.tone }));
  return {
    id: item.id,
    name: item.name.value,
    amount: item.amount.value,
    ...(mealBadges.length > 0 ? { mealBadges } : {}),
    inCart: item.state.value === 'in-cart',
  };
};

/**
 * Groceries from the live list (R10, R50): GroceryListTemplate fed by the app facade. The Item model holds
 * no sections, meal badges or who-added yet, so the things to buy sit in one section and carry none of those.
 */
export function GroceriesScreen({ app, kitchenId }: GroceriesScreenProps) {
  const go = useGo();
  const weekId = useMemo(() => weekIdFor(app.now()), [app]);
  const days = useMemo(() => weekDays(app.now()).days, [app]);
  const [items, setItems] = useState<readonly Item[]>([]);
  const [meals, setMeals] = useState<readonly Meal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [problem, setProblem] = useState<string | undefined>(undefined);
  // Held here, above the width switch, so folding or unfolding keeps it (R43).
  const [mealId, setMealId] = useState<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const inner = width >= INNER_MIN_WIDTH;

  useEffect(
    () =>
      app.watchWeekItems(
        kitchenId,
        weekId,
        (next) => setItems(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );
  useEffect(
    () =>
      app.watchWeekMeals(
        kitchenId,
        weekId,
        (next) => setMeals(next),
        (error) => setLoadError(error.message),
      ),
    [app, kitchenId, weekId],
  );

  const weekMeals = meals.map((m) => ({ id: m.id, name: m.name.value, tone: mealTone(m.id), day: days.find((d) => d.dayIndex === m.dayIndex.value)?.weekday ?? '' }));

  const add = async () => {
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name };
    const result = await app.dispatch(command);
    setProblem(undefined);
    if (result.ok) {
      setName('');
      return;
    }
    setProblem(result.error.code === 'empty-name' ? 'Type what to buy first' : 'Could not add that item');
  };

  const toggle = async (itemId: string, inCart: boolean) => {
    const command: SetItemState = { type: 'SetItemState', kitchenId, weekId, itemId, inCart };
    const result = await app.dispatch(command);
    setProblem(result.ok ? undefined : 'Could not update that item');
  };

  const clear = async () => {
    const command: ClearCart = { type: 'ClearCart', kitchenId, weekId };
    const result = await app.dispatch(command);
    setProblem(result.ok ? undefined : 'Could not clear the cart');
  };

  const banner = problem ?? (loadError ? `Could not load the list: ${loadError}` : undefined);
  const rows = visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) }).map((item) => toListItem(item, weekMeals));
  const toBuy = rows.filter((r) => !r.inCart);
  const cartItems = rows.filter((r) => r.inCart);
  const badged = new Map(items.map((i) => [i.id, i.badges]));
  const forMeal = (id: string) => toBuy.filter((r) => badged.get(r.id)?.includes(id));
  const chosen = weekMeals.find((meal) => meal.id === mealId);
  const shown = chosen ? forMeal(chosen.id) : toBuy;
  const showAll = () => setMealId(undefined);

  return (
    <GroceryListTemplate
      weekLabel={weekLabelFor(app.now())}
      members={[]}
      layout={inner ? 'inner' : 'phone'}
      rail={{
        activeSection: 'groceries',
        toGo: toBuy.length,
        meals: weekMeals.map((meal) => ({ id: meal.id, name: meal.name, day: meal.day, count: forMeal(meal.id).length, tone: meal.tone })),
        ...(chosen ? { selectedMealId: chosen.id } : {}),
        onSelectSection: (id) => id === 'plan' && go.plan(),
        onSelectMeal: setMealId,
        onShowAll: showAll,
        onPlanMeal: () => go.addMeal(todayId(app.now())),
      }}
      {...(chosen ? { filter: { mealName: chosen.name, count: shown.length, tone: chosen.tone, onShowAll: showAll } } : {})}
      mascot={toBuy.length === 0 && cartItems.length > 0 ? 'enoki' : 'cremi'}
      toGo={toBuy.length}
      inCart={cartItems.length}
      addValue={name}
      onAddValueChange={setName}
      onAdd={() => void add()}
      onAddItem={go.quickAdd}
      onToggleItem={(id, inCart) => void toggle(id, inCart)}
      onClearCart={() => void clear()}
      onSettings={go.settings}
      onOpenPlan={go.plan}
      {...(banner ? { banner: { kind: 'offline' as const, message: banner } } : {})}
      sections={shown.length > 0 ? [{ id: 'to-buy', icon: 'cart', title: 'This week', items: shown }] : []}
      cartItems={cartItems}
    />
  );
}
