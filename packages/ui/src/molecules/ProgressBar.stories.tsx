import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ProgressBar } from './ProgressBar.tsx';

const meta = { title: 'Molecules/ProgressBar', component: ProgressBar, args: { toGo: 14, inCart: 3 } } satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { toGo: 17, inCart: 0 } };
export const Part: Story = {};
export const Full: Story = { args: { toGo: 0, inCart: 17 } };
