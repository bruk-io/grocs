import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { IconTile } from './IconTile.tsx';

const meta = { title: 'Atoms/IconTile', component: IconTile, args: { icon: 'produce' } } satisfies Meta<typeof IconTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
export const Positive: Story = { args: { icon: 'cart', tone: 'positive' } };
