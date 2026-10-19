import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// Cremi the cremini: bouncy and eager. Idle bounce; tap hop (grocs.css cremi-bounce, cremi-hop).
const bounce = { '0%': frame(), '50%': frame({ y: -5 }), '100%': frame() } as CSSAnimationKeyframes;
const hop = {
  '0%': frame(),
  '30%': frame({ y: -16, sx: 0.95, sy: 1.06 }),
  '55%': frame({ sx: 1.08, sy: 0.92 }),
  '75%': frame({ y: -4 }),
  '100%': frame(),
} as CSSAnimationKeyframes;

const stir = {
  '0%': frame({ y: 0, rotate: -2 }),
  '50%': frame({ y: -3, rotate: 3 }),
  '100%': frame({ y: 0, rotate: -2 }),
} as CSSAnimationKeyframes;

export const cremi: MascotData = {
  name: 'cremi',
  title: 'Cremi the cremini',
  lines: ["Stirring! Don't tell Chanty I salted it.", "Soup's on! Well... almost.", 'Hi! I keep your list tidy, too.'],
  idle: { keyframes: bounce, duration: 'mascotBounce', easing: 'soft', iterations: 'infinite', origin: '50% 100%' },
  reaction: { keyframes: hop, duration: 'mascotHop', easing: 'hop', iterations: 1, origin: '50% 100%' },
  reactionPose: '30%',
  blinkRy: 2.6,
  poses: { stir: { show: ['spoon'], idle: { keyframes: stir, duration: 'mascotStir', easing: 'soft', iterations: 'infinite', origin: '50% 100%' } } },
};
