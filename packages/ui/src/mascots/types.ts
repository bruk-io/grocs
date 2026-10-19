import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import type { tokens } from '../tokens/tokens.ts';
import type { MascotName } from './art/index.ts';

/** A motion token name (tokens.motion.duration). Mascot files hold names, never milliseconds (R39). */
export type DurationToken = keyof typeof tokens.motion.duration;
/** A motion token name (tokens.motion.easing). */
export type EasingToken = keyof typeof tokens.motion.easing;

/** One piece of whole-body motion, ported from the canvas keyframes (decision-5). */
export interface BodyAnimation {
  keyframes: CSSAnimationKeyframes;
  duration: DurationToken;
  easing: EasingToken;
  /** How many times it plays; the idle loops are 'infinite'. */
  iterations: number | 'infinite';
  /** Where it pivots, as the canvas set it with transform-origin. */
  origin: string;
}

/**
 * One mushroom, as data (R62, decision-5): its look is the art, its lines and motion are here.
 * `reactionPose` names the keyframe of `reaction` that is held as a still frame when motion is reduced.
 */
export interface MascotData {
  name: MascotName;
  /** "Morty the morel": the spoken name; the button's label adds the tap hint. */
  title: string;
  lines: readonly string[];
  idle: BodyAnimation;
  reaction: BodyAnimation;
  reactionPose: string;
  /** The eyes' resting `ry`; present when the eyes are ellipses that blink. */
  blinkRy?: number;
  /** True when the mushroom starts asleep: eyes shut and "z" drifting until it is first tapped (Shii). */
  asleep?: boolean;
  /** Named poses with props, drawn from the Welcome scene. */
  poses?: Readonly<Record<string, MascotPose>>;
}

/** A pose that holds a prop (the spoon, the scrub brush and tomato): the parts it shows and its own idle motion. */
export interface MascotPose {
  show: readonly string[];
  idle: BodyAnimation;
}

/** What the Mascot is doing; each has a story (R61, R63). */
export type MascotState = 'rest' | 'idle' | 'reacting' | 'speaking';
