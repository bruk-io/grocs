import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AvatarStack } from './AvatarStack.tsx';

const meta = {
  title: 'Molecules/AvatarStack',
  component: AvatarStack,
  args: {
    members: [
      { name: 'Alex', tone: 'forest' },
      { name: 'Sam', tone: 'chartreuse' },
    ],
  },
} satisfies Meta<typeof AvatarStack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Away: Story = {};
export const Online: Story = {
  args: {
    members: [
      { name: 'Alex', tone: 'forest' },
      { name: 'Sam', tone: 'chartreuse', online: true },
    ],
  },
};
