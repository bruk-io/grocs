// GENERATED from design/svg/mascots/ollie.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Ellipse, G, Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function OllieArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="stem" as={Path} d="M30 42h8l1 12a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z" fill={tokens.color.mascot.ollieStem} />
        <Part name="cap" as={G}>
          <Path d="M6 36C6 21 18 11 34 11c13 0 24 7 24 18 0 8-6 12-14 13l-24 2C12 44 6 42 6 36z" fill={tokens.color.mascot.ollieCap} />
          <Path d="M12 39c4 1.6 8 .8 12 1.6s8 0 12 .8 8-.8 10-1.6" fill="none" stroke={tokens.color.mascot.ollieRim} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M20 18c4-3 9-4 14-4M14 25c5-6 13-9 22-9" fill="none" stroke={tokens.color.mascot.ollieLine} strokeWidth={1.6} strokeLinecap="round" />
        </Part>
        <Part name="eyeL" as={Ellipse} cx={26} cy={29} rx={2} ry={2.4} fill={tokens.color.mascot.ink} />
        <Part name="eyeR" as={Ellipse} cx={35} cy={29} rx={2} ry={2.4} fill={tokens.color.mascot.ink} />
        <Part name="blushL" as={Ellipse} cx={21.5} cy={33.5} rx={3.4} ry={2} fill={tokens.color.mascot.blush} />
        <Part name="blushR" as={Ellipse} cx={39.5} cy={33.5} rx={3.4} ry={2} fill={tokens.color.mascot.blush} />
        <Part name="mouth" as={Path} d="M28.5 34.5q1.2-1 2.4 0t2.4 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.6} strokeLinecap="round" />
      </Part>
    </Svg>
  );
}
