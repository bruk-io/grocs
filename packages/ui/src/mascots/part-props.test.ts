import { describe, expect, it } from 'vitest';
import { mascots } from './data.ts';
import { motionFor } from './motion.ts';
import { partPropsFor } from './part-props.ts';

const style = (props: ReturnType<typeof partPropsFor>, part: string) => props[part]?.['style'] as Record<string, unknown> | undefined;

describe('partPropsFor', () => {
  it('blinks the eyes of a mushroom with ellipse eyes while it idles', () => {
    const props = partPropsFor(mascots.cremi, motionFor(mascots.cremi, 'idle', false));
    for (const eye of ['eyeL', 'eyeR']) {
      expect(style(props, eye)?.['animationIterationCount']).toBe('infinite');
      expect(style(props, eye)?.['animationName']).toEqual({ '0%': { ry: 2.6 }, '92%': { ry: 2.6 }, '95%': { ry: 0.26 }, '100%': { ry: 2.6 } });
    }
  });

  it('reveals the props a pose holds', () => {
    const props = partPropsFor(mascots.morty, motionFor(mascots.morty, 'idle', false, 'scrub'));
    expect(props['scrub']).toEqual({ opacity: 1 });
    expect(props['tomato']).toEqual({ opacity: 1 });
    expect(partPropsFor(mascots.morty, motionFor(mascots.morty, 'idle', false))).not.toHaveProperty('tomato');
  });

  it('moves no part when motion is reduced or the mushroom is at rest', () => {
    for (const m of Object.values(mascots)) {
      expect(partPropsFor(m, motionFor(m, 'idle', true)), `${m.name} reduced`).not.toHaveProperty('eyeL.style');
      expect(partPropsFor(m, motionFor(m, 'rest', false)), `${m.name} rest`).not.toHaveProperty('eyeL.style');
    }
  });

  it('gives the enoki, whose eyes are closed arcs, nothing to blink', () => {
    expect(partPropsFor(mascots.enoki, motionFor(mascots.enoki, 'idle', false))).toEqual({});
  });

  it('keeps the sleeper asleep: shut eyes shown, open eyes hidden, z drifting, no blink', () => {
    const props = partPropsFor(mascots.shii, motionFor(mascots.shii, 'idle', false));
    expect(props['eyesShut']).toEqual({ opacity: 1 });
    expect(props['eyeL']).toEqual({ opacity: 0 });
    expect(style(props, 'zzA')?.['animationDelay']).toBe(0);
    expect(style(props, 'zzB')?.['animationDelay']).toBeGreaterThan(0);
  });

  it('wakes the sleeper on a tap: open eyes shown, shut eyes hidden, no z', () => {
    const props = partPropsFor(mascots.shii, motionFor(mascots.shii, 'speaking', false));
    expect(props['eyesShut']).toEqual({ opacity: 0 });
    expect(props['eyeL']).toMatchObject({ opacity: 1 });
    expect(props).not.toHaveProperty('zzA');
  });

  it('shows the sleeper awake in a reduced reaction too, with nothing moving', () => {
    const props = partPropsFor(mascots.shii, motionFor(mascots.shii, 'reacting', true));
    expect(props['eyeL']).toEqual({ opacity: 1 });
    expect(props['eyesShut']).toEqual({ opacity: 0 });
  });
});
