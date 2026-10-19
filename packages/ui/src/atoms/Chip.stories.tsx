import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Chip } from './Chip.tsx';

const meta = { title: 'Atoms/Chip', component: Chip, args: { label: 'Chana masala' } } satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

// chip.meal
export const Rest: Story = {};
export const Pressed: Story = { args: { forceState: 'pressed' } };
export const Selected: Story = { args: { selected: true } };
export const Focus: Story = { args: { forceState: 'focus' } };
export const Disabled: Story = { args: { disabled: true } };

// chip.quick-add
const quickAdd = { kind: 'quickAdd', label: 'Bananas' } as const;
export const QuickAddRest: Story = { args: quickAdd };
export const QuickAddPressed: Story = { args: { ...quickAdd, forceState: 'pressed' } };
export const QuickAddSelected: Story = { args: { ...quickAdd, selected: true } };
export const QuickAddFocus: Story = { args: { ...quickAdd, forceState: 'focus' } };
export const QuickAddDisabled: Story = { args: { ...quickAdd, disabled: true } };
