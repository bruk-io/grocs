import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
import { cart, chanaProduce, household, meat, offlineDairy, offlineProduce, produce, railMeals, toastDairy, toastProduce } from './fixtures.ts';
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

const allSections = [
  { id: 'produce', icon: 'produce', title: 'Produce', items: produce },
  { id: 'meat', icon: 'meat', title: 'Meat', items: meat },
] as const;
const chanaFilter = { mealName: 'Chana masala', count: 5, tone: 'amber' } as const;

/** The list narrowed to Chana masala on the phone: the filter line on top, then only its items. */
export const Filtered: Story = {
  args: { filter: chanaFilter, sections: [{ id: 'produce', icon: 'produce', title: 'Produce', items: chanaProduce }] },
};
/** A meal with nothing left to buy on the phone. */
export const EmptyMeal: Story = {
  args: { filter: { mealName: 'Green salad', count: 0, tone: 'leaf' }, sections: [] },
};

/** The Fold's inner screen: the meal rail on the left, the list filling the rest, no floating tab bar. */
export const InnerGroceries: Story = {
  args: {
    layout: 'inner',
    rail: { activeSection: 'groceries', toGo: 14, meals: railMeals },
    toast: { name: 'Sam', message: 'Sam added Oat milk · just now' },
    sections: allSections,
  },
};
/** Inner screen with Chana masala chosen in the rail: the filter line and only its items. */
export const InnerFiltered: Story = {
  args: {
    layout: 'inner',
    rail: { activeSection: 'groceries', toGo: 14, meals: railMeals, selectedMealId: 'chana' },
    filter: chanaFilter,
    sections: [{ id: 'produce', icon: 'produce', title: 'Produce', items: chanaProduce }],
  },
};
/** Inner screen with a meal that has nothing left to buy. */
export const InnerEmptyMeal: Story = {
  args: {
    layout: 'inner',
    rail: { activeSection: 'groceries', toGo: 14, meals: railMeals, selectedMealId: 'salad' },
    filter: { mealName: 'Green salad', count: 0, tone: 'leaf' },
    sections: [],
  },
};
/** Inner screen with no meals planned yet: the rail offers only All items and Plan a meal. */
export const InnerNoMeals: Story = {
  args: { layout: 'inner', rail: { activeSection: 'groceries', toGo: 14, meals: [] }, sections: allSections },
};
