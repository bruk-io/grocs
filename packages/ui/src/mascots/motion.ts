// The Mascot's motion decisions as pure functions (decision-5, decision-11 level 2): which keyframes,
// which still pose and how long, for a state and the reduce-motion setting. No React, no clock.
import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { tokens } from '../tokens/tokens.ts';
import type { BodyAnimation, MascotData, MascotState } from './types.ts';

/** The still frame held when motion is reduced: a style, not an animation. */
export type PoseStyle = Record<string, unknown>;

export interface BodyPlan {
  keyframes: CSSAnimationKeyframes;
  durationMs: number;
  /** A CSS timing function string from tokens.motion.easing. */
  easing: string;
  iterations: number | 'infinite';
  origin: string;
}

export interface MotionPlan {
  /** Whole-body animation to run, or null for none. */
  body: BodyPlan | null;
  /** A still frame to hold in place of an animation (reduced reactions only). */
  pose: PoseStyle | null;
  /** Prop parts to show (a pose's spoon, tomato, scrub). */
  show: readonly string[];
  /** The eyes blink. */
  blink: boolean;
  /** The mushroom is awake (a sleeper has opened its eyes). */
  awake: boolean;
  /** The speech bubble: not shown, grows in, or fades in (reduced). */
  bubble: 'none' | 'pop' | 'fade';
  /** How long this state lasts before the next one, in ms; null means until something changes it. */
  holdMs: number | null;
}

function body(animation: BodyAnimation): BodyPlan {
  return {
    keyframes: animation.keyframes,
    durationMs: tokens.motion.duration[animation.duration],
    easing: tokens.motion.easing[animation.easing],
    iterations: animation.iterations,
    origin: animation.origin,
  };
}

/** How long a reaction plays: one iteration's token duration times the iteration count. */
export function reactionMs(data: MascotData): number {
  const { iterations, duration } = data.reaction;
  return tokens.motion.duration[duration] * (iterations === 'infinite' ? 1 : iterations);
}

/** The held frame of a reaction: its keyframe `reactionPose`, without the timing function. */
export function poseOf(data: MascotData): PoseStyle {
  const frame = (data.reaction.keyframes as Record<string, Record<string, unknown>>)[data.reactionPose];
  if (frame === undefined) throw new Error(`${data.name}: reaction has no keyframe "${data.reactionPose}"`);
  const { animationTimingFunction: _timing, ...style } = frame;
  return style;
}

/**
 * What the mascot does in a state (decision-5). Reduced motion keeps every state readable without movement:
 * idle holds still, a tap holds the reaction's pose for its duration, and the bubble fades instead of growing.
 * The line is announced either way; that is the caller's job, not a motion.
 */
export function motionFor(data: MascotData, state: MascotState, reduced: boolean, pose?: string): MotionPlan {
  const held = pose === undefined ? undefined : data.poses?.[pose];
  if (pose !== undefined && held === undefined) throw new Error(`${data.name} has no pose "${pose}"`);
  const idle = held?.idle ?? data.idle;
  const show = held?.show ?? [];
  switch (state) {
    case 'rest':
      return { body: null, pose: null, show, blink: false, awake: false, bubble: 'none', holdMs: null };
    case 'idle':
      return { body: reduced ? null : body(idle), pose: null, show, blink: !reduced, awake: false, bubble: 'none', holdMs: null };
    case 'reacting':
      return {
        body: reduced ? null : body(data.reaction),
        pose: reduced ? poseOf(data) : null,
        show,
        blink: false,
        awake: true,
        bubble: reduced ? 'fade' : 'pop',
        holdMs: reactionMs(data),
      };
    case 'speaking':
      return {
        body: reduced ? null : body(idle),
        pose: null,
        show,
        blink: !reduced,
        awake: true,
        bubble: reduced ? 'fade' : 'pop',
        holdMs: Math.max(tokens.motion.duration.talk - reactionMs(data), 0),
      };
  }
}

/** The line for the nth tap (1 is the first): in order, wrapping, never random, so stories and tests are repeatable. */
export function lineFor(lines: readonly string[], tap: number): string {
  if (lines.length === 0) return '';
  const index = (Math.max(tap, 1) - 1) % lines.length;
  return lines[index] as string;
}

/** The blink keyframes for eyes with resting height `ry`: shut to a tenth for a moment near the end of each cycle. */
export function blinkKeyframes(ry: number): CSSAnimationKeyframes {
  const shut = ry / 10;
  return { '0%': { ry }, '92%': { ry }, '95%': { ry: shut }, '100%': { ry } } as unknown as CSSAnimationKeyframes;
}
