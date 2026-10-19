import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { CelebrationBanner } from './CelebrationBanner.tsx';

const meta = { title: 'Organisms/CelebrationBanner', component: CelebrationBanner } satisfies Meta<typeof CelebrationBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
