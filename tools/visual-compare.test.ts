import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { MAX_DIFF_RATIO, compareImages } from './visual-compare.ts';

function solid(width: number, height: number, [r, g, b]: [number, number, number], paint: (png: PNG) => void = () => {}): Buffer {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) png.data.set([r, g, b, 255], i * 4);
  paint(png);
  return PNG.sync.write(png);
}
const dot = (x: number, y: number) => (png: PNG) => png.data.set([0, 0, 0, 255], (y * png.width + x) * 4);

describe('compareImages (decision-11, level 3)', () => {
  it('treats identical images as the same', () => {
    expect(compareImages(solid(100, 100, [240, 240, 235]), solid(100, 100, [240, 240, 235])).same).toBe(true);
  });

  it('tolerates a few stray pixels, under the limit', () => {
    // 100 x 100 = 10,000 pixels; the limit is 0.1%, which is 10.
    const result = compareImages(solid(100, 100, [255, 255, 255]), solid(100, 100, [255, 255, 255], dot(3, 3)));
    expect(result.same).toBe(true);
    expect(MAX_DIFF_RATIO).toBe(0.001);
  });

  it('fails when more of the picture changed than the limit', () => {
    const many = (png: PNG) => {
      for (let x = 0; x < 30; x++) dot(x, 0)(png);
    };
    const result = compareImages(solid(100, 100, [255, 255, 255]), solid(100, 100, [255, 255, 255], many));
    expect(result.same).toBe(false);
    expect(result.reason).toContain('pixels differ');
    expect(result.diff).not.toBeNull();
  });

  it('fails a different colour everywhere', () => {
    expect(compareImages(solid(50, 50, [255, 255, 255]), solid(50, 50, [20, 70, 40])).same).toBe(false);
  });

  it('fails a different size and says so', () => {
    const result = compareImages(solid(100, 100, [255, 255, 255]), solid(100, 120, [255, 255, 255]));
    expect(result.same).toBe(false);
    expect(result.reason).toBe('size changed from 100 x 100 to 100 x 120');
  });
});
