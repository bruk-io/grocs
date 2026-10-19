import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ActivityToast } from './ActivityToast.tsx';

const meta = { title: 'Molecules/ActivityToast', component: ActivityToast, args: { name: 'Shazya', message: 'Shazya added Oat milk · just now' } } satisfies Meta<typeof ActivityToast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Not a state: the board's second toast. */
export const Planned: Story = { args: { message: 'Shazya planned Pizza night · Friday' } };
