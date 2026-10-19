import type { ReactNode } from 'react';
import Svg from 'react-native-svg';
import { tokens } from '../tokens/tokens.ts';
import type { IconProps } from './icon-props.ts';

/**
 * The 24 point grid every icon is drawn on: one round stroke at the width from the tokens (R62).
 * The generated icons hold only their shapes; the stroke, the colour and the accessibility live here.
 */
export function IconFrame({ color = tokens.color.ink, size = tokens.size.icon, label, children }: IconProps & { children: ReactNode }) {
  const a11y = label
    ? ({ accessible: true, accessibilityRole: 'image', accessibilityLabel: label } as const)
    : ({ accessible: false, accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const);
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={tokens.stroke.icon}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
    >
      {children}
    </Svg>
  );
}
