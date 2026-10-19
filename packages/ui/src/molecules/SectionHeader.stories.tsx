import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SectionHeader } from './SectionHeader.tsx';

const meta = { title: 'Molecules/SectionHeader', component: SectionHeader, args: { icon: 'produce', title: 'Produce', count: 6 } } satisfies Meta<typeof SectionHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
/** Not a state: the second section of the board. */
export const DairyAndEggs: Story = { args: { icon: 'dairy', title: 'Dairy & eggs', count: 2 } };
