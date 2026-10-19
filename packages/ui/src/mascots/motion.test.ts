import { describe, expect, it } from 'vitest';
import { tokens } from '../tokens/tokens.ts';
import { mascots } from './data.ts';
import { blinkKeyframes, lineFor, motionFor, poseOf, reactionMs } from './motion.ts';

const all = Object.values(mascots);

describe('motionFor', () => {
  it.each(all)('$name idles with its own keyframes at token durations and easing', (m) => {
    const plan = motionFor(m, 'idle', false);
    expect(plan.body?.keyframes).toBe(m.idle.keyframes);
    expect(plan.body?.durationMs).toBe(tokens.motion.duration[m.idle.duration]);
    expect(plan.body?.easing).toBe(tokens.motion.easing[m.idle.easing]);
    expect(plan.body?.iterations).toBe('infinite');
    expect(plan.blink).toBe(true);
    expect(plan.bubble).toBe('none');
    expect(plan.holdMs).toBeNull();
  });

  it.each(all)('$name reacts with its reaction keyframes and a growing bubble', (m) => {
    const plan = motionFor(m, 'reacting', false);
    expect(plan.body?.keyframes).toBe(m.reaction.keyframes);
    expect(plan.body?.iterations).toBe(m.reaction.iterations);
    expect(plan.pose).toBeNull();
    expect(plan.bubble).toBe('pop');
    expect(plan.awake).toBe(true);
    expect(plan.holdMs).toBe(reactionMs(m));
  });

  it.each(all)('$name holds still when motion is reduced, in every state', (m) => {
    for (const state of ['rest', 'idle', 'reacting', 'speaking'] as const) {
      const plan = motionFor(m, state, true);
      expect(plan.body, `${m.name} ${state}`).toBeNull();
      expect(plan.blink, `${m.name} ${state}`).toBe(false);
    }
  });

  it.each(all)('$name shows its reaction pose as a still frame, and fades its bubble, when reduced', (m) => {
    const plan = motionFor(m, 'reacting', true);
    expect(plan.pose).toEqual(poseOf(m));
    expect(plan.pose).toHaveProperty('transform');
    expect(plan.bubble).toBe('fade');
    expect(plan.holdMs).toBe(reactionMs(m));
    expect(motionFor(m, 'idle', true).pose).toBeNull();
  });

  it.each(all)('$name keeps the bubble up until the talk duration has passed since the tap', (m) => {
    const reacting = motionFor(m, 'reacting', false);
    const speaking = motionFor(m, 'speaking', false);
    expect((reacting.holdMs ?? 0) + (speaking.holdMs ?? 0)).toBe(tokens.motion.duration.talk);
    expect(speaking.body?.keyframes).toBe(m.idle.keyframes);
    expect(speaking.bubble).toBe('pop');
  });

  it('draws nothing moving at rest, and the sleeper stays asleep until tapped', () => {
    const rest = motionFor(mascots.shii, 'rest', false);
    expect(rest).toEqual({ body: null, pose: null, show: [], blink: false, awake: false, bubble: 'none', holdMs: null });
    expect(motionFor(mascots.shii, 'idle', false).awake).toBe(false);
    expect(motionFor(mascots.shii, 'speaking', false).awake).toBe(true);
  });

  it('plays the giggle twice and counts both in how long the reaction lasts', () => {
    expect(mascots.enoki.reaction.iterations).toBe(2);
    expect(reactionMs(mascots.enoki)).toBe(tokens.motion.duration.mascotGiggle * 2);
  });
});

describe('poses with props', () => {
  it('shows the spoon and runs the stir for Cremi, and the brush and tomato for Morty', () => {
    const stir = motionFor(mascots.cremi, 'idle', false, 'stir');
    expect(stir.show).toEqual(['spoon']);
    expect(stir.body?.keyframes).toBe(mascots.cremi.poses?.['stir']?.idle.keyframes);
    expect(stir.body?.durationMs).toBe(tokens.motion.duration.mascotStir);
    expect(motionFor(mascots.morty, 'idle', false, 'scrub').show).toEqual(['scrub', 'tomato']);
  });
  it('still shows the props, holding still, when motion is reduced', () => {
    const plan = motionFor(mascots.morty, 'idle', true, 'scrub');
    expect(plan.show).toEqual(['scrub', 'tomato']);
    expect(plan.body).toBeNull();
  });
  it('shows no props without a pose, and rejects a pose the mushroom lacks', () => {
    expect(motionFor(mascots.cremi, 'idle', false).show).toEqual([]);
    expect(() => motionFor(mascots.cremi, 'idle', false, 'scrub')).toThrow(/no pose "scrub"/);
  });
});

describe('poseOf', () => {
  it('names a keyframe that exists in every mascot, so a reduced tap always has a frame to hold', () => {
    for (const m of all) {
      expect(Object.keys(m.reaction.keyframes), m.name).toContain(m.reactionPose);
      expect(() => poseOf(m)).not.toThrow();
    }
  });

  it('fails loudly when the pose names no keyframe', () => {
    expect(() => poseOf({ ...mascots.cremi, reactionPose: '12%' })).toThrow(/no keyframe "12%"/);
  });
});

describe('lineFor', () => {
  const lines = ['a', 'b', 'c'];
  it('goes through the lines in order and wraps', () => {
    expect([1, 2, 3, 4, 5].map((n) => lineFor(lines, n))).toEqual(['a', 'b', 'c', 'a', 'b']);
  });
  it('treats a count below one as the first tap, and no lines as silence', () => {
    expect(lineFor(lines, 0)).toBe('a');
    expect(lineFor([], 3)).toBe('');
  });
});

describe('blinkKeyframes', () => {
  it('shuts the eyes to a tenth of their height near the end of the cycle and reopens them', () => {
    expect(blinkKeyframes(2.6)).toEqual({ '0%': { ry: 2.6 }, '92%': { ry: 2.6 }, '95%': { ry: 0.26 }, '100%': { ry: 2.6 } });
  });
});

describe('mascot data', () => {
  it.each(all)('$name has lines, a title and token names that exist', (m) => {
    expect(m.lines.length).toBeGreaterThan(0);
    expect(m.title).toMatch(/^(The|\w+ the) /);
    for (const a of [m.idle, m.reaction]) {
      expect(tokens.motion.duration).toHaveProperty(a.duration);
      expect(tokens.motion.easing).toHaveProperty(a.easing);
    }
  });
});
