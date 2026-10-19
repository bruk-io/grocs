import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Badge } from './Badge.tsx';

const meta = { title: 'Atoms/Badge', component: Badge, args: { label: 'Chana masala' } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Amber: Story = { args: { tone: 'amber' } };
export const Sky: Story = { args: { tone: 'sky', label: 'Sheet-pan chicken' } };
export const Tomato: Story = { args: { tone: 'tomato', label: 'Pizza night' } };
export const Leaf: Story = { args: { tone: 'leaf', label: 'Green salad' } };
export const Neutral: Story = { args: { tone: 'neutral', label: 'Eating out' } };
