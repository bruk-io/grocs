import { useState } from 'react';
import { GroceryListTemplate } from '@grocs/ui';
import type { GroceryListTemplateProps } from '@grocs/ui';
import { cart, household, meat, offlineDairy, offlineProduce, produce, toastDairy, toastProduce } from '../sample/sample-data.ts';
import { useGo } from './navigate.ts';

/** Which of the reference's Groceries screens to show: the list (Main), Offline, Toast, nothing on the list, everything in the cart. */
export type GroceriesState = 'groceries' | 'offline' | 'toast' | 'empty' | 'allDone';

type Shown = Pick<GroceryListTemplateProps, 'mascot' | 'toGo' | 'inCart' | 'sections' | 'cartItems' | 'toast' | 'banner'>;

const SHOWN: Record<GroceriesState, Shown> = {
  groceries: {
    mascot: 'cremi',
    toGo: 14,
    inCart: 3,
    toast: { name: 'Shazya', message: 'Shazya added Oat milk · just now' },
    sections: [
      { id: 'produce', icon: 'produce', title: 'Produce', items: produce },
      { id: 'meat', icon: 'meat', title: 'Meat', items: meat },
    ],
    cartItems: [],
  },
  offline: {
    mascot: 'ollie',
    toGo: 14,
    inCart: 3,
    banner: { kind: 'offline', message: 'Offline. 2 changes waiting.', actionLabel: 'Try again' },
    sections: [
      { id: 'produce', icon: 'produce', title: 'Produce', items: offlineProduce },
      { id: 'dairy', icon: 'dairy', title: 'Dairy & eggs', items: offlineDairy },
    ],
    cartItems: [],
  },
  toast: {
    mascot: 'cremi',
    toGo: 14,
    inCart: 3,
    toast: { name: 'Shazya', message: 'Shazya added Oat milk · just now' },
    sections: [
      { id: 'dairy', icon: 'dairy', title: 'Dairy & eggs', items: toastDairy },
      { id: 'produce', icon: 'produce', title: 'Produce', items: toastProduce },
    ],
    cartItems: [],
  },
  empty: { mascot: 'cremi', toGo: 0, inCart: 0, sections: [], cartItems: [] },
  allDone: { mascot: 'enoki', toGo: 0, inCart: 3, sections: [], cartItems: cart },
};

/** Groceries with sample data (the live list stays on the home route for now). Plan, settings and add lead where the design shows. */
export function GroceriesScreen({ state = 'groceries' }: { state?: GroceriesState }) {
  const go = useGo();
  const [addValue, setAddValue] = useState('');
  return (
    <GroceryListTemplate
      weekLabel="Week of Oct 19"
      members={household}
      addValue={addValue}
      onAddValueChange={setAddValue}
      onAdd={go.quickAdd}
      onAddItem={go.quickAdd}
      onSettings={go.settings}
      onOpenPlan={go.plan}
      {...SHOWN[state]}
    />
  );
}
