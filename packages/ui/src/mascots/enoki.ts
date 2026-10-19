import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// The enoki siblings: giggly. The three stalks sway together; the canvas swayed them out of step, but a
// group's transform is not an animatable SVG prop on the phones (decision-5). Tap giggles twice
// (grocs.css enoki-bob, enoki-giggle).
const bob = { '0%': frame({ rotate: -4 }), '50%': frame({ rotate: 4 }), '100%': frame({ rotate: -4 }) } as CSSAnimationKeyframes;
const giggle = {
  '0%': frame(),
  '25%': frame({ y: -4, rotate: -12 }),
  '75%': frame({ y: -4, rotate: 12 }),
  '100%': frame(),
} as CSSAnimationKeyframes;

export const enoki: MascotData = {
  name: 'enoki',
  title: 'The enoki siblings',
  lines: ['Let us in! We brought snacks!', 'Is it dinner yet?', 'Group wave!'],
  idle: { keyframes: bob, duration: 'mascotSway', easing: 'soft', iterations: 'infinite', origin: '50% 100%' },
  reaction: { keyframes: giggle, duration: 'mascotGiggle', easing: 'soft', iterations: 2, origin: '50% 100%' },
  reactionPose: '25%',
};
