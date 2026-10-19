import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EmptyList } from './EmptyList.tsx';

const meta = { title: 'Organisms/EmptyList', component: EmptyList } satisfies Meta<typeof EmptyList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
