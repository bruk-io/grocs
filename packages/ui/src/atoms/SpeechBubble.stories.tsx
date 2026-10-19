import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SpeechBubble } from './SpeechBubble.tsx';

const meta = { title: 'Atoms/SpeechBubble', component: SpeechBubble, args: { message: "Mm? I'm resting my eyes." } } satisfies Meta<typeof SpeechBubble>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};
