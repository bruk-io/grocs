import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// Morty the morel: nerdy. Idle ponder; tap nod (grocs.css morty-ponder, morty-nod).
const ponder = {
  '0%': frame(),
  '70%': frame(),
  '80%': frame({ rotate: 8 }),
  '90%': frame({ rotate: 8 }),
  '100%': frame(),
} as CSSAnimationKeyframes;
const nod = {
  '0%': frame(),
  '20%': frame({ y: 4, sx: 1.04, sy: 0.96 }),
  '40%': frame(),
  '60%': frame({ y: 4, sx: 1.04, sy: 0.96 }),
  '80%': frame({ y: -6 }),
  '100%': frame(),
} as CSSAnimationKeyframes;

const scrub = { '0%': frame({ rotate: -4 }), '50%': frame({ rotate: 4 }), '100%': frame({ rotate: -4 }) } as CSSAnimationKeyframes;

export const morty: MascotData = {
  name: 'morty',
  title: 'Morty the morel',
  lines: ['Washing tomatoes. Three down.', "Fun fact: I'm mostly holes.", 'Clean veggies, happy kitchen.'],
  idle: { keyframes: ponder, duration: 'mascotPonder', easing: 'soft', iterations: 'infinite', origin: '50% 50%' },
  reaction: { keyframes: nod, duration: 'mascotQuick', easing: 'soft', iterations: 1, origin: '50% 100%' },
  reactionPose: '20%',
  blinkRy: 2.3,
  poses: { scrub: { show: ['scrub', 'tomato'], idle: { keyframes: scrub, duration: 'mascotQuick', easing: 'soft', iterations: 'infinite', origin: '50% 50%' } } },
};
