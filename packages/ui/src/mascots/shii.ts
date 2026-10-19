import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { frame } from './frame.ts';
import type { MascotData } from './types.ts';

// Shii the shiitake: sleepy and wise. Asleep (eyes shut, "z" drifting) until tapped; snooze breathing;
// tap startle (grocs.css shii-snooze, shii-startle).
const snooze = { '0%': frame(), '50%': frame({ sx: 1.03, sy: 0.96 }), '100%': frame() } as CSSAnimationKeyframes;
const startle = {
  '0%': frame(),
  '20%': frame({ y: -8, sx: 0.9, sy: 1.14 }),
  '35%': frame({ x: -3 }),
  '50%': frame({ x: 3 }),
  '65%': frame({ x: -2 }),
  '100%': frame(),
} as CSSAnimationKeyframes;

export const shii: MascotData = {
  name: 'shii',
  title: 'Shii the shiitake',
  lines: ["Mm? I'm resting my eyes.", 'Top of the fridge is the warmest spot.', 'Plan once, shop once, nap often.'],
  idle: { keyframes: snooze, duration: 'mascotSnooze', easing: 'soft', iterations: 'infinite', origin: '50% 100%' },
  reaction: { keyframes: startle, duration: 'mascotStartle', easing: 'out', iterations: 1, origin: '50% 100%' },
  reactionPose: '20%',
  blinkRy: 2.8,
  asleep: true,
};
