// The kitchen's motion decisions as a pure function (decision-5, decision-11 level 2): what moves, how long
// each loop takes (motion tokens), and that nothing moves when motion is reduced (R41, R60).
import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import type { PartProps } from '../../mascots/part.tsx';
import { tokens } from '../../tokens/tokens.ts';
import { bobKeyframes, doorKeyframes, glowKeyframes, GLOW_PARTS, panKeyframes, steamKeyframes, STEAM_PARTS, WORLD } from './art/scene-layout.ts';

/** The style props Reanimated's CSS animations take. */
export interface LoopStyle {
  animationName: CSSAnimationKeyframes;
  animationDuration: number;
  animationDelay: number;
  animationIterationCount: 'infinite';
  animationTimingFunction: string;
  transformOrigin?: string;
}

export interface SceneMotion {
  /** The camera drifting along the kitchen. */
  pan: LoopStyle | null;
  /** The whole kitchen breathing. */
  bob: LoopStyle | null;
  /** The cupboard door swinging open for Ollie. */
  door: LoopStyle | null;
  /** Steam and lamp light, by the name of the part of the art that moves. */
  parts: PartProps;
}

function loop(animationName: CSSAnimationKeyframes, animationDuration: number, easing: string, animationDelay = 0, transformOrigin?: string): LoopStyle {
  return {
    animationName,
    animationDuration,
    animationDelay,
    animationIterationCount: 'infinite',
    animationTimingFunction: easing,
    ...(transformOrigin ? { transformOrigin } : {}),
  };
}

const STILL: SceneMotion = { pan: null, bob: null, door: null, parts: {} };

/** What moves in the kitchen. When motion is reduced nothing does: the camera rests at the fridge, the door is shut. */
export function sceneMotion(reduced: boolean, visibleWidth: number = WORLD.width): SceneMotion {
  if (reduced) return STILL;
  const { duration, easing } = tokens.motion;
  const steamStep = duration.mascotCycle / STEAM_PARTS.length;
  const parts: Record<string, Record<string, unknown>> = {};
  STEAM_PARTS.forEach((name, index) => {
    parts[name] = { style: loop(steamKeyframes, duration.mascotCycle, easing.out, steamStep * index) };
  });
  for (const name of GLOW_PARTS) parts[name] = { style: loop(glowKeyframes, duration.mascotFloat, easing.soft) };
  return {
    pan: loop(panKeyframes(visibleWidth), duration.kitchenPan, easing.soft),
    bob: loop(bobKeyframes, duration.kitchenBob, easing.soft),
    door: loop(doorKeyframes, duration.mascotPeek, easing.soft, 0, '100% 50%'),
    parts,
  };
}
