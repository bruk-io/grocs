import { tokens } from '../tokens/tokens.ts';

/** The ring drawn around a focused control: forest, outside the edge, with a gap (R42). */
export const focusRing = {
  outlineWidth: tokens.size.focusOutline,
  outlineColor: tokens.color.forest,
  outlineStyle: 'solid',
  outlineOffset: tokens.size.focusOffset,
} as const;
