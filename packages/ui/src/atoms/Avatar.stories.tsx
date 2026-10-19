import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Avatar } from './Avatar.tsx';

const meta = { title: 'Atoms/Avatar', component: Avatar, args: { name: 'Bruk' } } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {};
export const Online: Story = { args: { name: 'Shazya', tone: 'chartreuse', online: true } };
export const Small: Story = { args: { name: 'Shazya', size: 's' } };
export const Xl: Story = { args: { size: 'xl' } };
export const XlOnline: Story = { args: { size: 'xl', online: true } };
