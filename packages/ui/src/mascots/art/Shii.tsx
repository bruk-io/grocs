// GENERATED from design/svg/mascots/shii.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Ellipse, G, Path, Svg, Text } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function ShiiArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="stem" as={Path} d="M24 36h16l1.5 18a5 5 0 0 1-5 5.5h-9a5 5 0 0 1-5-5.5z" fill={tokens.color.mascot.shiiStem} />
        <Part name="cap" as={G}>
          <Path d="M4 36c0-12 13-22 28-22s28 10 28 22c0 3-2 4-5 4H9c-3 0-5-1-5-4z" fill={tokens.color.mascot.shiiCap} />
          <Path d="M15 27l4 2M30 20l1 4M44 24l-3 3M23 32l3-1M39 33h3M50 30l-2-2" fill="none" stroke={tokens.color.mascot.shiiSpot} strokeWidth={2.4} strokeLinecap="round" />
        </Part>
        <Part name="eyesShut" as={Path} d="M26 47q2 1.8 4 0M34 47q2 1.8 4 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.8} strokeLinecap="round" />
        <Part name="eyeL" as={Ellipse} cx={28} cy={46.5} rx={2.2} ry={2.8} fill={tokens.color.mascot.ink} opacity={0} />
        <Part name="eyeR" as={Ellipse} cx={36} cy={46.5} rx={2.2} ry={2.8} fill={tokens.color.mascot.ink} opacity={0} />
        <Part name="blushL" as={Ellipse} cx={24.5} cy={52} rx={2.6} ry={1.6} fill={tokens.color.mascot.blush} />
        <Part name="blushR" as={Ellipse} cx={39.5} cy={52} rx={2.6} ry={1.6} fill={tokens.color.mascot.blush} />
        <Part name="mouth" as={Path} d="M30.5 52.5q1.5 1.4 3 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.6} strokeLinecap="round" />
      </Part>
      <Part name="zzA" as={Text} x={52} y={12} fontFamily="Fredoka" fontSize={10} fontWeight={600} fill={tokens.color.mascot.inkMuted} opacity={0}>
        z
      </Part>
      <Part name="zzB" as={Text} x={57} y={5} fontFamily="Fredoka" fontSize={7} fontWeight={600} fill={tokens.color.mascot.inkMuted} opacity={0}>
        z
      </Part>
    </Svg>
  );
}
