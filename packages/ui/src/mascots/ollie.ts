import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// Ollie the oyster: shy. Idle lean; tap hides (grocs.css ollie-lean, ollie-hide).
const lean = {
  '0%': frame(),
  '60%': frame(),
  '70%': frame({ x: -2, rotate: -8 }),
  '85%': frame({ x: -2, rotate: -8 }),
  '100%': frame(),
} as CSSAnimationKeyframes;
const hide = {
  '0%': frame({ shown: true }),
  '25%': frame({ x: 10, rotate: 12, sx: 0.6, sy: 0.6, tucked: true }),
  '70%': frame({ x: 10, rotate: 12, sx: 0.6, sy: 0.6, tucked: true }),
  '100%': frame({ shown: true }),
} as CSSAnimationKeyframes;

export const ollie: MascotData = {
  name: 'ollie',
  title: 'Ollie the oyster',
  lines: ['Oh! You found me...', 'I was just... checking the spices.', '...hi.'],
  idle: { keyframes: lean, duration: 'mascotLean', easing: 'soft', iterations: 'infinite', origin: '30% 100%' },
  reaction: { keyframes: hide, duration: 'react', easing: 'soft', iterations: 1, origin: '50% 50%' },
  reactionPose: '25%',
  blinkRy: 2.4,
};
