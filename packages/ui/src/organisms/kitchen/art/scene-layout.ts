// Where everything sits in the Welcome kitchen, in the scene's own coordinates (1020 x 600), and how the
// camera and the doors move. Ported from the canvas (Welcome.dc.html, grocs.css kitchen-*). Like the art,
// this is geometry in the scene's own space, not design values: the durations are motion tokens.
import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import type { MascotName } from '../../../mascots/art/index.ts';

export const WORLD = { width: 1020, height: 600 } as const;

export interface CastPlace {
  name: MascotName;
  left: number;
  top: number;
  size: number;
  pose?: 'stir' | 'scrub';
}

/** The six hosts, back to front. Ollie hides in the cupboard until the door opens, so the door is drawn over him. */
export const CAST_BEHIND_DOOR: readonly CastPlace[] = [{ name: 'ollie', left: 396, top: 303, size: 56 }];
export const CAST_IN_FRONT: readonly CastPlace[] = [
  { name: 'shii', left: 46, top: 176, size: 62 },
  { name: 'morty', left: 350, top: 372, size: 62, pose: 'scrub' },
  { name: 'cremi', left: 584, top: 369, size: 64, pose: 'stir' },
  { name: 'chanty', left: 806, top: 360, size: 66 },
  { name: 'enoki', left: 917, top: 384, size: 56 },
];

export const DOOR = { left: 383, top: 243, width: 83, height: 120 } as const;

const at = (x: number) => ({ transform: [{ translateX: x }] });

/** The camera: rest at the fridge, drift to the stove, then to the garden door, and back. */
export const panKeyframes = {
  '0%': at(0),
  '9%': at(0),
  '27%': at(-290),
  '39%': at(-290),
  '57%': at(-630),
  '69%': at(-630),
  '90%': at(0),
  '100%': at(0),
} as unknown as CSSAnimationKeyframes;

/** The whole kitchen breathing a little. */
export const bobKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -4 }] },
  '100%': { transform: [{ translateY: 0 }] },
} as unknown as CSSAnimationKeyframes;

/** The cupboard door swings open to show Ollie, then closes. */
export const doorKeyframes = {
  '0%': { transform: [{ scaleX: 1 }] },
  '8%': { transform: [{ scaleX: 1 }] },
  '18%': { transform: [{ scaleX: 0.1 }] },
  '76%': { transform: [{ scaleX: 0.1 }] },
  '86%': { transform: [{ scaleX: 1 }] },
  '100%': { transform: [{ scaleX: 1 }] },
} as unknown as CSSAnimationKeyframes;

/** Steam rising from the pot: fades in and out. */
export const steamKeyframes = {
  '0%': { opacity: 0 },
  '20%': { opacity: 0.9 },
  '100%': { opacity: 0 },
} as unknown as CSSAnimationKeyframes;

/** The light from the lamps breathing. */
export const glowKeyframes = {
  '0%': { opacity: 0.16 },
  '50%': { opacity: 0.26 },
  '100%': { opacity: 0.16 },
} as unknown as CSSAnimationKeyframes;

/** Steam puffs start a third of a cycle apart. */
export const STEAM_PARTS = ['steam', 'steam2', 'steam3'] as const;
export const GLOW_PARTS = ['glow', 'glow2', 'glow3', 'glow4'] as const;
