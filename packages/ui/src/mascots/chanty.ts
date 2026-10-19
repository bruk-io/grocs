import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// Chanty the chanterelle: dramatic. Idle strut; tap twirl (grocs.css chanty-strut, chanty-twirl).
const strut = { '0%': frame({ rotate: -5 }), '50%': frame({ rotate: 5 }), '100%': frame({ rotate: -5 }) } as CSSAnimationKeyframes;
const twirl = { '0%': frame(), '70%': frame({ rotate: 380, sx: 1.12, sy: 1.12 }), '100%': frame({ rotate: 360 }) } as CSSAnimationKeyframes;

export const chanty: MascotData = {
  name: 'chanty',
  title: 'Chanty the chanterelle',
  lines: ['Watering the basil, darling.', 'Golden hour is my best light.', 'Recipes are my love language.'],
  idle: { keyframes: strut, duration: 'mascotCycle', easing: 'soft', iterations: 'infinite', origin: '50% 50%' },
  reaction: { keyframes: twirl, duration: 'mascotTwirl', easing: 'twirl', iterations: 1, origin: '50% 70%' },
  reactionPose: '70%',
  blinkRy: 2.8,
};
