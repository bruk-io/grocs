import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Badge } from './Badge.tsx';

const meta = { title: 'Atoms/Badge', component: Badge, args: { label: 'Taco night' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
