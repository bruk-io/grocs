import { describe, expect, it } from 'vitest';
import { viewportsFor } from './storybook-browser.ts';

describe('viewportsFor (decision-11: phone width, plus the Fold sizes for templates)', () => {
  it('draws components at phone width only', () => {
    expect(viewportsFor({ id: 'atoms-button--rest', title: 'Atoms/Button' }).map((v) => v.name)).toEqual(['iphone']);
  });

  it('draws templates at the phone and both Fold screens', () => {
    expect(viewportsFor({ id: 'templates-list--rest', title: 'Templates/List' }).map((v) => v.name)).toEqual(['iphone', 'fold-outer', 'fold-inner']);
  });
});
