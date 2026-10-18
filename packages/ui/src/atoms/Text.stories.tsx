import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from './Text.tsx';

const meta = { title: 'Atoms/Text', component: Text, args: { children: 'Oat milk' } } satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: 'body' } };
export const Title: Story = { args: { variant: 'title', children: 'This week' } };
export const Caption: Story = { args: { variant: 'caption', children: 'Added by Bruk' } };
export const Muted: Story = { args: { variant: 'muted', children: '2 cartons' } };
export const Struck: Story = { args: { variant: 'struck' } };
