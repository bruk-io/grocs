import { describe, expect, it } from 'vitest';
import { judgeMotion, MIN_PAN_TRAVEL_PX, MIN_SCENE_ELEMENTS, viewportsFor } from './storybook-browser.ts';
import type { MotionReading } from './storybook-browser.ts';

describe('judgeMotion (the browser pass shows stories still, so the pan is checked on a page that allows motion)', () => {
  const panning: MotionReading = { drifting: 12, sidewaysAnimations: 1, travel: 630, elements: 40 };
  const bobbingOnly: MotionReading = { drifting: 12, sidewaysAnimations: 0, travel: 0, elements: 40 };
  const still: MotionReading = { drifting: 0, sidewaysAnimations: 0, travel: 0, elements: 40 };

  it('accepts a pan that carries the scene sideways', () => {
    expect(judgeMotion(panning, 'pans')).toEqual([]);
  });

  it('rejects a scene that only bobs: moving is not panning', () => {
    expect(judgeMotion(bobbingOnly, 'pans')).toHaveLength(1);
  });

  it('rejects a wobble shorter than a pan', () => {
    expect(judgeMotion({ drifting: 3, sidewaysAnimations: 1, travel: MIN_PAN_TRAVEL_PX - 1, elements: 40 }, 'pans')).toHaveLength(1);
  });

  it('accepts a scene where nothing moves, as reduced', () => {
    expect(judgeMotion(still, 'still')).toEqual([]);
  });

  it('rejects a reduced scene where anything moves, or that pans', () => {
    expect(judgeMotion(bobbingOnly, 'still')).toHaveLength(1);
    expect(judgeMotion(panning, 'still')).toHaveLength(1);
  });

  it('rejects a reduced story that drew no scene', () => {
    const empty = judgeMotion({ drifting: 0, sidewaysAnimations: 0, travel: 0, elements: 0 }, 'still');
    expect(empty).toHaveLength(1);
    expect(empty[0]).toContain('R41');
    expect(judgeMotion({ ...still, elements: MIN_SCENE_ELEMENTS - 1 }, 'still')).toHaveLength(1);
  });

  it('names the rule in what it reports', () => {
    expect(judgeMotion(still, 'pans')[0]).toContain('R41');
    expect(judgeMotion(panning, 'still')[0]).toContain('R41');
  });
});

describe('viewportsFor (decision-11: phone width, plus the Fold sizes for templates)', () => {
  it('draws components at phone width only', () => {
    expect(viewportsFor({ id: 'atoms-button--rest', title: 'Atoms/Button' }).map((v) => v.name)).toEqual(['iphone']);
  });

  it('draws templates at the phone and both Fold screens', () => {
    expect(viewportsFor({ id: 'templates-list--rest', title: 'Templates/List' }).map((v) => v.name)).toEqual(['iphone', 'fold-outer', 'fold-inner']);
  });
});
