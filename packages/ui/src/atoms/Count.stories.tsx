import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Count } from './Count.tsx';

const meta = { title: 'Atoms/Count', component: Count, args: { value: 5 } } satisfies Meta<typeof Count>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Accent: Story = { args: { tone: 'accent', value: 14 } };
