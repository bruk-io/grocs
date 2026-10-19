import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Tag } from './Tag.tsx';

const meta = { title: 'Atoms/Tag', component: Tag, args: { label: 'On your list' } } satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Status: Story = { args: { kind: 'status' } };
export const Neutral: Story = { args: { kind: 'neutral', label: 'Pantry staple' } };
export const New: Story = { args: { kind: 'new', label: 'New' } };
export const Sync: Story = { args: { kind: 'sync', label: 'Waiting to send' } };
export const Date: Story = { args: { kind: 'date', label: 'Thursday, Oct 22' } };
