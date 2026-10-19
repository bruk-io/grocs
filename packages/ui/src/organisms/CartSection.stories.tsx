import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { CartSection } from './CartSection.tsx';

const meta = {
  title: 'Organisms/CartSection',
  component: CartSection,
  args: {
    items: [
      { id: 'a', name: 'Bananas', inCart: true },
      { id: 'b', name: 'Coffee beans', inCart: true },
    ],
  },
} satisfies Meta<typeof CartSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
