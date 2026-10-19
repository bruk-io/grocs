// One keyframe block for a mascot's whole body. Every block lists the same transform operations in the
// same order, so Reanimated can interpolate between any two of them.
import { tokens } from '../tokens/tokens.ts';

export interface FrameOptions {
  x?: number;
  y?: number;
  /** Degrees. */
  rotate?: number;
  /** Horizontal and vertical scale. */
  sx?: number;
  sy?: number;
  /** Half faded, as Ollie is when tucked away. */
  tucked?: boolean;
  /** Fully shown; used by animations that fade, so their ends match their middles. */
  shown?: boolean;
}

export function frame({ x = 0, y = 0, rotate = 0, sx = 1, sy = 1, tucked, shown }: FrameOptions = {}) {
  const transform = [{ translateX: x }, { translateY: y }, { rotate: `${rotate}deg` }, { scaleX: sx }, { scaleY: sy }];
  if (tucked) return { transform, opacity: tokens.opacity.tucked };
  if (shown) return { transform, opacity: 1 };
  return { transform };
}
