import { useEffect, useMemo, useState } from 'react';
import type { AddItem, ClearCart, SetItemState } from '@grocs/application';
import { visibleItems, weekIdFor } from '@grocs/core';
import type { Item } from '@grocs/core';
import { GroceryListTemplate } from '@grocs/ui';
import type { ListItem } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import { useGo } from './navigate.ts';

export interface GroceriesScreenProps {
  app: App;
  kitchenId: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

/** "Week of Oct 19": the Monday (UTC, as the week id counts) of the week that holds `at`. */
function weekLabelFor(at: number): string {
  const days = Math.floor(at / DAY_MS);
  const monday = new Date((days - ((((days + 3) % 7) + 7) % 7)) * DAY_MS);
  return `Week of ${MONTHS[monday.getUTCMonth()]} ${monday.getUTCDate()}`;
}

const toListItem = (item: Item): ListItem => ({
  id: item.id,
  name: item.name.value,
  amount: item.amount.value,
  inCart: item.state.value === 'in-cart',
});

/**
 * Groceries from the live list (R10, R50): GroceryListTemplate fed by the app facade. The Item model holds
 * no sections, meal badges or who-added yet, so the things to buy sit in one section and carry none of those.
 */
export function GroceriesScreen({ app, kitchenId }: GroceriesScreenProps) {
  const go = useGo();
  const weekId = useMemo(() => weekIdFor(app.now()), [app]);
  const [items, setItems] = useState<readonly Item[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [problem, setProblem] = useState<string | undefined>(undefined);

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
  const rows = visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) }).map(toListItem);
  const toBuy = rows.filter((r) => !r.inCart);
  const cartItems = rows.filter((r) => r.inCart);

  return (
    <GroceryListTemplate
      weekLabel={weekLabelFor(app.now())}
      members={[]}
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
      sections={toBuy.length > 0 ? [{ id: 'to-buy', icon: 'cart', title: 'This week', items: toBuy }] : []}
      cartItems={cartItems}
    />
  );
}
