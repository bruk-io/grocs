// Which named parts of a mascot's art move, and how (decision-5). Pure: data in, props by part name out.
// Only opacity and the eyes' `ry` are animated on parts, because those are the SVG props Reanimated can
// animate on the phones; whole-body motion is the Mascot's wrapper.
import type { CSSAnimationKeyframes } from 'react-native-reanimated';
import { tokens } from '../tokens/tokens.ts';
import { blinkKeyframes } from './motion.ts';
import type { MotionPlan } from './motion.ts';
import type { PartProps } from './part.tsx';
import type { MascotData } from './types.ts';

const zFloat = {
  '0%': { opacity: 0 },
  '20%': { opacity: 1 },
  '100%': { opacity: 0 },
} as unknown as CSSAnimationKeyframes;

function loop(keyframes: CSSAnimationKeyframes, durationMs: number, delayMs = 0) {
  return {
    animationName: keyframes,
    animationDuration: durationMs,
    animationDelay: delayMs,
    animationIterationCount: 'infinite',
    animationTimingFunction: tokens.motion.easing.soft,
  };
}

/** Part props for one mascot in one plan: blinking eyes, a sleeper's shut eyes and drifting "z". */
export function partPropsFor(data: MascotData, plan: MotionPlan): PartProps {
  const out: Record<string, Record<string, unknown>> = {};
  for (const prop of plan.show) out[prop] = { opacity: 1 };
  if (data.asleep === true) {
    // Asleep: the shut-eye arcs show and the open eyes are hidden; awake it is the other way round.
    out['eyesShut'] = { opacity: plan.awake ? 0 : 1 };
    const eye = { opacity: plan.awake ? 1 : 0 };
    out['eyeL'] = eye;
    out['eyeR'] = eye;
    const cycle = tokens.motion.duration.mascotCycle;
    if (!plan.awake && plan.blink) {
      out['zzA'] = { style: loop(zFloat, cycle) };
      out['zzB'] = { style: loop(zFloat, cycle, cycle / 2) };
    }
  }
  if (plan.blink && data.blinkRy !== undefined && (data.asleep !== true || plan.awake)) {
    const style = { style: loop(blinkKeyframes(data.blinkRy), tokens.motion.duration.mascotBlink) };
    out['eyeL'] = { ...out['eyeL'], ...style };
    out['eyeR'] = { ...out['eyeR'], ...style };
  }
  return out;
}
