// GENERATED from design/svg/mascots/cremi.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Ellipse, G, Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function CremiArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="spoon" as={Ellipse} cx={16} cy={47} rx={6} ry={3.5} fill={tokens.color.mascot.cremiStem} transform="rotate(20 16 47)" opacity={0} />
        <Part name="stem" as={Path} d="M22 34h20l2 20a5 5 0 0 1-5 6H25a5 5 0 0 1-5-6z" fill={tokens.color.mascot.cremiStem} />
        <Part name="cap" as={G}>
          <Path d="M6 34C6 18 18 8 32 8s26 10 26 26c0 3-2 4-5 4H11c-3 0-5-1-5-4z" fill={tokens.color.mascot.cremiCap} />
          <Path d="M14 23c3-6 9-9 15-10" fill="none" stroke={tokens.color.mascot.cremiShine} strokeWidth={3} strokeLinecap="round" />
        </Part>
        <Part name="eyeL" as={Ellipse} cx={28} cy={45.5} rx={2} ry={2.6} fill={tokens.color.mascot.ink} />
        <Part name="eyeR" as={Ellipse} cx={36} cy={45.5} rx={2} ry={2.6} fill={tokens.color.mascot.ink} />
        <Part name="blushL" as={Ellipse} cx={24.5} cy={50.5} rx={2.6} ry={1.6} fill={tokens.color.mascot.blush} />
        <Part name="blushR" as={Ellipse} cx={39.5} cy={50.5} rx={2.6} ry={1.6} fill={tokens.color.mascot.blush} />
        <Part name="mouth" as={Path} d="M29.5 50q2.5 3.6 5 0z" fill={tokens.color.mascot.ink} />
      </Part>
    </Svg>
  );
}
