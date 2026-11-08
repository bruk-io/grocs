import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type { AddItem, ClearCart, SetItemAisle, SetItemState } from '@grocs/application';
import { AISLES, groupByAisle, aisleSection, visibleItems, weekIdFor } from '@grocs/core';
import type { AisleId, Item, Meal } from '@grocs/core';
import { GroceryListTemplate } from '@grocs/ui';
import type { AisleOption, GrocerySection, IconName, ListItem } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';
import { avatarsFor, useKitchenInfo } from './use-kitchen-info.ts';
import { mealTone, todayId, weekDays, weekLabelFor } from './week-days.ts';

export interface GroceriesScreenProps {
  app: App;
  kitchenId: string;
}

/** The inner layout applies from here up (decision-14: the medium width class), by window width, not by device. */
export const INNER_MIN_WIDTH = 600;

/** The aisles' ids are also section icon names, except 'other', which has none (R11): shown as 'cart'. */
const AISLE_ICONS: Record<Exclude<AisleId, 'other'>, IconName> = {
  produce: 'produce',
  dairy: 'dairy',
  meat: 'meat',
  bakery: 'bakery',
  pantry: 'pantry',
};

function iconForAisle(id: AisleId): IconName {
  return id === 'other' ? 'cart' : AISLE_ICONS[id];
}

const AISLE_OPTIONS: readonly AisleOption[] = AISLES.map((a) => ({ id: a.id, label: a.label }));

const toListItem = (item: Item, weekMeals: readonly { id: string; name: string; tone: ReturnType<typeof mealTone> }[], addedByName: string | undefined): ListItem => {
  const mealBadges = weekMeals.filter((meal) => item.badges.includes(meal.id)).map((meal) => ({ label: meal.name, tone: meal.tone }));
  return {
    id: item.id,
    name: item.name.value,
    amount: item.amount.value,
    ...(mealBadges.length > 0 ? { mealBadges } : {}),
    ...(addedByName ? { addedBy: addedByName } : {}),
    inCart: item.state.value === 'in-cart',
    // A stored aisle outside the fixed list shows 'Other' selected (R11), matching groupByAisle's own fallback.
    selectedAisleId: aisleSection(item.aisle.value),
  };
};

/**
 * Groceries from the live list (R9, R10, R11, R50): GroceryListTemplate fed by the app facade. Things
 * to buy are grouped by aisle (core's groupByAisle), each row shows who added it by name from the
 * kitchen's members, and a row is pressable to change its aisle with the chips core and application
 * teach the memory for next time.
 */
export function GroceriesScreen({ app, kitchenId }: GroceriesScreenProps) {
  const kitchen = useKitchenInfo(app, kitchenId);
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
  const [openAisleItemId, setOpenAisleItemId] = useState<string | null>(null);
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

  const chooseAisle = async (itemId: string, aisle: string) => {
    setOpenAisleItemId(null);
    const command: SetItemAisle = { type: 'SetItemAisle', kitchenId, weekId, itemId, aisle };
    const result = await app.dispatch(command);
    setProblem(result.ok ? undefined : 'Could not change the aisle');
  };

  // Nothing while the kitchen has not loaded, or for a uid that is not (or is no longer) a member.
  const nameOf = (uid: string): string | undefined => kitchen?.members.find((m) => m.uid === uid)?.name;

  const banner = problem ?? (loadError ? `Could not load the list: ${loadError}` : undefined);
  const visible = visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) });
  const toBuyItems = visible.filter((i) => i.state.value !== 'in-cart');
  const cartItems = visible.filter((i) => i.state.value === 'in-cart').map((item) => toListItem(item, weekMeals, nameOf(item.addedBy)));
  const forMeal = (id: string) => toBuyItems.filter((i) => i.badges.includes(id));
  const chosen = weekMeals.find((meal) => meal.id === mealId);
  // The aisle sections stay under a meal filter (R9, R11): only which items are grouped narrows.
  const shownItems = chosen ? forMeal(chosen.id) : toBuyItems;
  const sections: readonly GrocerySection[] = groupByAisle(shownItems).map((group) => ({
    id: group.id,
    icon: iconForAisle(group.id),
    title: group.label,
    items: group.items.map((item) => toListItem(item, weekMeals, nameOf(item.addedBy))),
  }));
  const showAll = () => setMealId(undefined);

  return (
    <GroceryListTemplate
      weekLabel={weekLabelFor(app.now())}
      members={avatarsFor(kitchen)}
      layout={inner ? 'inner' : 'phone'}
      rail={{
        activeSection: 'groceries',
        toGo: toBuyItems.length,
        meals: weekMeals.map((meal) => ({ id: meal.id, name: meal.name, day: meal.day, count: forMeal(meal.id).length, tone: meal.tone })),
        ...(chosen ? { selectedMealId: chosen.id } : {}),
        onSelectSection: (id) => id === 'plan' && go.plan(),
        onSelectMeal: setMealId,
        onShowAll: showAll,
        onPlanMeal: () => go.addMeal(todayId(app.now())),
      }}
      {...(chosen ? { filter: { mealName: chosen.name, count: shownItems.length, tone: chosen.tone, onShowAll: showAll } } : {})}
      mascot={toBuyItems.length === 0 && cartItems.length > 0 ? 'enoki' : 'cremi'}
      toGo={toBuyItems.length}
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
      sections={sections}
      cartItems={cartItems}
      aisleOptions={AISLE_OPTIONS}
      openAisleItemId={openAisleItemId}
      onPressItem={(id) => setOpenAisleItemId((current) => (current === id ? null : id))}
      onChooseAisle={(id, aisleId) => void chooseAisle(id, aisleId)}
    />
  );
}
