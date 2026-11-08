import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { withPhoneInsets } from './phone-insets.ts';
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

/** The same screen under a phone's status bar and gesture bar: nothing sits in either band. */
export const OnPhone: Story = { ...Typing, decorators: [withPhoneInsets] };

const aisleOptions = [
  { id: 'produce', label: 'Produce' },
  { id: 'dairy', label: 'Dairy & eggs' },
  { id: 'other', label: 'Other' },
];

/** With the amount field filled in and an aisle chosen. */
export const WithAmountAndAisle: Story = {
  args: { amountValue: '2 cartons', aisleOptions, selectedAisleId: 'dairy' },
};
