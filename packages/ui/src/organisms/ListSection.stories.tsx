import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ListSection } from './ListSection.tsx';

const meta = {
  title: 'Organisms/ListSection',
  component: ListSection,
  args: {
    icon: 'pantry',
    title: 'Pantry',
    items: [
      { id: 'a', name: 'Chickpeas', amount: '2 cans', mealBadges: [{ label: 'Chana masala', tone: 'amber' }], addedBy: 'Shazya', inCart: false },
      { id: 'b', name: 'Basmati rice', amount: '2 kg', inCart: false },
    ],
  },
} satisfies Meta<typeof ListSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Offline: items not yet sent say so. */
export const Waiting: Story = {
  args: {
    icon: 'produce',
    title: 'Produce',
    items: [
      { id: 'a', name: 'Bananas', amount: '6', addedBy: 'Bruk', inCart: false },
      { id: 'b', name: 'Baby spinach', amount: '1 bag', addedBy: 'Bruk', inCart: false, waiting: true },
      { id: 'c', name: 'Limes', amount: '4', addedBy: 'Bruk', inCart: false, waiting: true },
    ],
  },
};
