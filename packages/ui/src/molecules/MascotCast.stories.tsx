import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Mascot } from './Mascot.tsx';
import { MotionProvider } from '../platform/motion.tsx';
import { tokens } from '../tokens/tokens.ts';
import type { MascotName } from '../mascots/art/index.ts';

// Each mushroom in the states R61 and R63 ask for: idle, reacting, speaking, reduced and pressed.
const room = (Story: () => React.JSX.Element) => (
  <View style={{ paddingTop: tokens.space[64] + tokens.space[40], alignItems: 'center' }}>
    <Story />
  </View>
);
const size = tokens.size.avatarXl * 2;

const meta = { title: 'Mascots/Cast', component: Mascot, args: { name: 'cremi', size }, decorators: [room] } satisfies Meta<typeof Mascot>;
export default meta;
type Story = StoryObj<typeof meta>;

const idle = (name: MascotName): Story => ({ args: { name } });
const reacting = (name: MascotName): Story => ({ args: { name, forceState: 'reacting' } });
const speaking = (name: MascotName): Story => ({ args: { name, forceState: 'speaking' } });
const pressed = (name: MascotName): Story => ({ args: { name, forceState: 'pressed' } });
const reduced = (name: MascotName): Story => ({
  args: { name, forceState: 'reacting' },
  decorators: [(Story) => <MotionProvider reduced><Story /></MotionProvider>],
});

export const CremiIdle = idle('cremi');
export const CremiReacting = reacting('cremi');
export const CremiSpeaking = speaking('cremi');
export const CremiReduced = reduced('cremi');
export const CremiPressed = pressed('cremi');

// The Welcome scene's poses: Cremi stirs with a spoon, Morty scrubs a tomato.
const posed = (name: MascotName, pose: 'stir' | 'scrub', forceState?: 'reacting'): Story => ({ args: { name, pose, ...(forceState ? { forceState } : {}) } });
export const CremiStir = posed('cremi', 'stir');
export const CremiStirReacting = posed('cremi', 'stir', 'reacting');
export const MortyScrub = posed('morty', 'scrub');
export const MortyScrubReacting = posed('morty', 'scrub', 'reacting');

export const ShiiIdle = idle('shii');
export const ShiiReacting = reacting('shii');
export const ShiiSpeaking = speaking('shii');
export const ShiiReduced = reduced('shii');
export const ShiiPressed = pressed('shii');

export const ChantyIdle = idle('chanty');
export const ChantyReacting = reacting('chanty');
export const ChantySpeaking = speaking('chanty');
export const ChantyReduced = reduced('chanty');
export const ChantyPressed = pressed('chanty');

export const OllieIdle = idle('ollie');
export const OllieReacting = reacting('ollie');
export const OllieSpeaking = speaking('ollie');
export const OllieReduced = reduced('ollie');
export const OlliePressed = pressed('ollie');

export const MortyIdle = idle('morty');
export const MortyReacting = reacting('morty');
export const MortySpeaking = speaking('morty');
export const MortyReduced = reduced('morty');
export const MortyPressed = pressed('morty');

export const EnokiIdle = idle('enoki');
export const EnokiReacting = reacting('enoki');
export const EnokiSpeaking = speaking('enoki');
export const EnokiReduced = reduced('enoki');
export const EnokiPressed = pressed('enoki');
