import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { meals, oftenBought, suggestions } from './fixtures.ts';
import { ItemPickerTemplate } from './ItemPickerTemplate.tsx';

const meta = {
  title: 'Templates/Item picker',
  component: ItemPickerTemplate,
  args: { weekLabel: 'Week of Oct 19', value: 'egg', onValueChange: () => undefined, meals, suggestions, frequent: oftenBought },
} satisfies Meta<typeof ItemPickerTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

/** QuickAdd. */
export const Typing: Story = {};
