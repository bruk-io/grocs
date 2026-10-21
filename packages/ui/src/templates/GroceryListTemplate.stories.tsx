import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { cart, household, meat, offlineDairy, offlineProduce, produce, toastDairy, toastProduce } from './fixtures.ts';
import { GroceryListTemplate } from './GroceryListTemplate.tsx';

const meta = {
  title: 'Templates/Grocery list',
  component: GroceryListTemplate,
  args: {
    weekLabel: 'Week of Oct 19',
    members: household,
    mascot: 'cremi',
    toGo: 14,
    inCart: 3,
    addValue: '',
    onAddValueChange: () => undefined,
    sections: [],
    cartItems: [],
  },
} satisfies Meta<typeof GroceryListTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Main: the list by section, with the partner's toast on top. */
export const Groceries: Story = {
  args: {
    toast: { name: 'Sam', message: 'Sam added Oat milk · just now' },
    sections: [
      { id: 'produce', icon: 'produce', title: 'Produce', items: produce },
      { id: 'meat', icon: 'meat', title: 'Meat', items: meat },
    ],
  },
};
/** Offline: changes wait to be sent, so the banner says so and their rows are tagged. */
export const Offline: Story = {
  args: {
    mascot: 'ollie',
    banner: { kind: 'offline', message: 'Offline. 2 changes waiting.', actionLabel: 'Try again' },
    sections: [
      { id: 'produce', icon: 'produce', title: 'Produce', items: offlineProduce },
      { id: 'dairy', icon: 'dairy', title: 'Dairy & eggs', items: offlineDairy },
    ],
  },
};
/** Toast: the other person just added Oat milk. */
export const Toast: Story = {
  args: {
    toast: { name: 'Sam', message: 'Sam added Oat milk · just now' },
    sections: [
      { id: 'dairy', icon: 'dairy', title: 'Dairy & eggs', items: toastDairy },
      { id: 'produce', icon: 'produce', title: 'Produce', items: toastProduce },
    ],
  },
};
/** Nothing on the list yet. */
export const Empty: Story = { args: { toGo: 0, inCart: 0 } };
/** Everything is in the cart: the celebration replaces the list. */
export const AllDone: Story = { args: { mascot: 'enoki', toGo: 0, inCart: 3, cartItems: cart } };

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Groceries, decorators: [withPhoneInsets] };
