import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Skeleton } from './Skeleton.tsx';

const meta = { title: 'Atoms/Skeleton', component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
