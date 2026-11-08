import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AisleChipGroup } from './AisleChipGroup.tsx';

const meta = {
  title: 'Molecules/AisleChipGroup',
  component: AisleChipGroup,
  args: {
    label: 'Aisle for Lemon',
    options: [
      { id: 'produce', label: 'Produce' },
      { id: 'pantry', label: 'Pantry' },
      { id: 'other', label: 'Other' },
    ],
  },
} satisfies Meta<typeof AisleChipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Produce chosen as the item's current aisle. */
export const Selected: Story = { args: { selectedId: 'produce' } };
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };
