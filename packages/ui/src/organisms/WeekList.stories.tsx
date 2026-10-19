import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { type PlanDay, WeekList } from './WeekList.tsx';

const week: readonly PlanDay[] = [
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

const meta = { title: 'Organisms/WeekList', component: WeekList, args: { days: week } } satisfies Meta<typeof WeekList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Nothing planned yet: every day shows the slot to plan one. */
export const Empty: Story = { args: { days: week.map((day) => ({ ...day, meals: [] })) } };
