// Sample content for the template stories: the data each reference screen shows. Stories only; the app passes real data.
import type { StackMember } from '../molecules/AvatarStack.tsx';
import type { ListItem } from '../organisms/ListSection.tsx';
import type { PlanDay } from '../organisms/WeekList.tsx';

/** Bruk and Shazya; Shazya is in the app now. */
export const household: readonly StackMember[] = [{ name: 'Bruk' }, { name: 'Shazya', tone: 'chartreuse', online: true }];

export const week: readonly PlanDay[] = [
  { id: '2026-10-19', weekday: 'Mon', day: 19, meals: [{ id: 'm1', name: 'Chana masala', tone: 'amber', link: 'example.com' }] },
  { id: '2026-10-20', weekday: 'Tue', day: 20, meals: [] },
  {
    id: '2026-10-21',
    weekday: 'Wed',
    day: 21,
    meals: [
      { id: 'm2', name: 'Sheet-pan chicken', tone: 'sky', link: 'example.com' },
      { id: 'm3', name: 'Green salad', tone: 'leaf' },
    ],
  },
  { id: '2026-10-22', weekday: 'Thu', day: 22, meals: [] },
  { id: '2026-10-23', weekday: 'Fri', day: 23, meals: [{ id: 'm4', name: 'Pizza night', tone: 'tomato' }] },
  { id: '2026-10-24', weekday: 'Sat', day: 24, meals: [{ id: 'm5', name: 'Eating out', tone: 'neutral' }] },
  { id: '2026-10-25', weekday: 'Sun', day: 25, meals: [] },
];

const chana = { label: 'Chana masala', tone: 'amber' } as const;
const chicken = { label: 'Sheet-pan chicken', tone: 'sky' } as const;
const pizza = { label: 'Pizza night', tone: 'tomato' } as const;

/** The Groceries screen: the top of the Produce section and the start of Meat. */
export const produce: readonly ListItem[] = [
  { id: 'i1', name: 'Yellow onions', amount: '2', mealBadges: [chana, chicken], inCart: false },
  { id: 'i2', name: 'Garlic', amount: '4 cloves', mealBadges: [chana], inCart: false },
  { id: 'i3', name: 'Bell peppers', amount: '3', mealBadges: [chicken], inCart: false },
  { id: 'i4', name: 'Lemon', amount: '1', mealBadges: [chana], inCart: false },
  { id: 'i5', name: 'Fresh ginger', amount: '3 cm piece', mealBadges: [chana], inCart: false },
  { id: 'i6', name: 'Cilantro', amount: '1 bunch', mealBadges: [chana], inCart: false },
];
export const meat: readonly ListItem[] = [{ id: 'i7', name: 'Chicken thighs', amount: '1 kg', mealBadges: [chicken], inCart: false }];

/** The Offline screen: two items wait to be sent. */
export const offlineProduce: readonly ListItem[] = [
  { id: 'o1', name: 'Bananas', amount: '6', addedBy: 'Bruk', inCart: false },
  { id: 'o2', name: 'Baby spinach', amount: '1 bag', addedBy: 'Bruk', inCart: false, waiting: true },
  { id: 'o3', name: 'Limes', amount: '4', addedBy: 'Bruk', inCart: false, waiting: true },
];
export const offlineDairy: readonly ListItem[] = [
  { id: 'o4', name: 'Oat milk', amount: '1 carton', addedBy: 'Shazya', inCart: false },
  { id: 'o5', name: 'Eggs', amount: '1 dozen', mealBadges: [pizza], addedBy: 'Bruk', inCart: false },
];

/** The Toast screen: Shazya just added Oat milk. */
export const toastDairy: readonly ListItem[] = [
  { id: 't1', name: 'Oat milk', amount: '1 carton', addedBy: 'Shazya', inCart: false, isNew: true },
  { id: 't2', name: 'Eggs', amount: '1 dozen', mealBadges: [pizza], addedBy: 'Bruk', inCart: false },
];
export const toastProduce: readonly ListItem[] = [
  { id: 't3', name: 'Bananas', amount: '6', addedBy: 'Bruk', inCart: false },
  { id: 't4', name: 'Baby spinach', amount: '1 bag', addedBy: 'Bruk', inCart: false },
];

export const cart: readonly ListItem[] = [
  { id: 'c1', name: 'Bananas', inCart: true },
  { id: 'c2', name: 'Coffee beans', inCart: true },
  { id: 'c3', name: 'Greek yogurt', inCart: true },
];

export const meals = [
  { id: 'chana', label: 'Chana masala', tone: 'amber' },
  { id: 'chicken', label: 'Sheet-pan chicken', tone: 'sky' },
  { id: 'pizza', label: 'Pizza night', tone: 'tomato' },
] as const;

export const suggestions = [
  { id: 's1', name: 'Eggs', detail: 'Dairy & eggs · usually 1 dozen' },
  { id: 's2', name: 'Egg noodles', detail: 'Pantry' },
  { id: 's3', name: 'Eggplant', detail: 'Produce' },
] as const;

export const oftenBought = [
  { id: 'f1', label: 'Bananas' },
  { id: 'f2', label: 'Limes' },
  { id: 'f3', label: 'Coffee beans' },
  { id: 'f4', label: 'Greek yogurt' },
  { id: 'f5', label: 'Sourdough loaf' },
  { id: 'f6', label: 'Baby spinach' },
] as const;
