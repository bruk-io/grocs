import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { WeekNav } from './WeekNav.tsx';

const meta = { title: 'Molecules/WeekNav', component: WeekNav, args: { label: 'Oct 19 - 25' } } satisfies Meta<typeof WeekNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
