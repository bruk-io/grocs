// GENERATED from design/svg/mascots/enoki.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Circle, Ellipse, G, Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function EnokiArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="stalkL" as={G}>
          <Path d="M20 56C18 43 16 30 13 17" fill="none" stroke={tokens.color.mascot.enokiEdge} strokeWidth={7} strokeLinecap="round" />
          <Path d="M20 56C18 43 16 30 13 17" fill="none" stroke={tokens.color.mascot.enokiStem} strokeWidth={4.5} strokeLinecap="round" />
          <Circle cx={13} cy={15} r={5} fill={tokens.color.mascot.enokiCap} stroke={tokens.color.mascot.enokiEdge} strokeWidth={1.5} />
        </Part>
        <Part name="stalkR" as={G}>
          <Path d="M44 56c2-13 4-26 7-39" fill="none" stroke={tokens.color.mascot.enokiEdge} strokeWidth={7} strokeLinecap="round" />
          <Path d="M44 56c2-13 4-26 7-39" fill="none" stroke={tokens.color.mascot.enokiStem} strokeWidth={4.5} strokeLinecap="round" />
          <Circle cx={51} cy={15} r={5} fill={tokens.color.mascot.enokiCap} stroke={tokens.color.mascot.enokiEdge} strokeWidth={1.5} />
        </Part>
        <Part name="stalkC" as={G}>
          <Path d="M32 57V22" fill="none" stroke={tokens.color.mascot.enokiEdge} strokeWidth={14} strokeLinecap="round" />
          <Path d="M32 57V22" fill="none" stroke={tokens.color.mascot.enokiStem} strokeWidth={11.5} strokeLinecap="round" />
          <Part name="cap" as={Ellipse} cx={32} cy={17} rx={10} ry={7.5} fill={tokens.color.mascot.enokiCap} stroke={tokens.color.mascot.enokiEdge} strokeWidth={1.5} />
          <Part name="eyeL" as={Path} d="M27.6 32q1.7-2.2 3.4 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.6} strokeLinecap="round" />
          <Part name="eyeR" as={Path} d="M33 32q1.7-2.2 3.4 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.6} strokeLinecap="round" />
          <Part name="blushL" as={Circle} cx={27} cy={35.5} r={1.4} fill={tokens.color.mascot.blush} />
          <Part name="blushR" as={Circle} cx={37} cy={35.5} r={1.4} fill={tokens.color.mascot.blush} />
          <Part name="mouth" as={Path} d="M30 36q2 3.4 4 0z" fill={tokens.color.mascot.ink} />
        </Part>
        <Path d="M14 55h36a3.5 3.5 0 0 1 0 7H14a3.5 3.5 0 0 1 0-7z" fill={tokens.color.mascot.enokiBase} />
      </Part>
    </Svg>
  );
}
