import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Tile } from './Tile.tsx';

const meta = { title: 'Atoms/Tile', component: Tile, args: { weekday: 'Thu', day: 22 } } satisfies Meta<typeof Tile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
