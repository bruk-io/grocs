// Compares a story's screenshot with its approved baseline (decision-11, level 3). Small differences in
// anti-aliasing are tolerated; a different size, or more than MAX_DIFF_RATIO of the pixels changed, is not.
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/** Share of pixels that may differ before the images count as different. */
export const MAX_DIFF_RATIO = 0.001;
/** How different one pixel's colour must be to count as changed (0 to 1; pixelmatch's own scale). */
export const PIXEL_THRESHOLD = 0.1;

export interface Comparison {
  readonly same: boolean;
  readonly reason: string;
  /** A PNG marking the changed pixels, when the sizes matched. */
  readonly diff: Buffer | null;
}

export function compareImages(approved: Uint8Array, actual: Uint8Array): Comparison {
  const a = PNG.sync.read(Buffer.from(approved));
  const b = PNG.sync.read(Buffer.from(actual));
  if (a.width !== b.width || a.height !== b.height) {
    return { same: false, reason: `size changed from ${a.width} x ${a.height} to ${b.width} x ${b.height}`, diff: null };
  }
  const out = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: PIXEL_THRESHOLD });
  const ratio = changed / (a.width * a.height);
  const same = ratio <= MAX_DIFF_RATIO;
  return { same, reason: `${changed} pixels differ (${(ratio * 100).toFixed(2)}%, limit ${(MAX_DIFF_RATIO * 100).toFixed(2)}%)`, diff: same ? null : PNG.sync.write(out) };
}
