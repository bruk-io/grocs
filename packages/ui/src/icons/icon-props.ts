export interface IconProps {
  /** Stroke colour. Defaults to the body text colour. */
  color?: string;
  /** Width and height in points. Defaults to the 24 point icon grid. */
  size?: number;
  /** What a screen reader says. An icon without a label is decorative and is hidden from it. */
  label?: string;
}
