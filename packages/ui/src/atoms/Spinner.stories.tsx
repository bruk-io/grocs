import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Spinner } from './Spinner.tsx';

const meta = { title: 'Atoms/Spinner', component: Spinner } satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
