// GENERATED from design/svg/mascots/chanty.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Ellipse, G, Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function ChantyArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="cap" as={G}>
          <Path d="M7 18c4-5 10-3 14-6s10-4 15-1 8 1 12 1 9 3 9 8c0 6-9 10-15 14l-3 18a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5l-3-18C15 30 7 25 7 18z" fill={tokens.color.mascot.chantyBody} />
          <Path d="M11 17c4-3 9-2 13-4s9-3 13-1 8 1 13 1" fill="none" stroke={tokens.color.mascot.chantyShine} strokeWidth={3} strokeLinecap="round" />
          <Path d="M27 37l1.5 12M32 37v13M37 37l-1.5 12" fill="none" stroke={tokens.color.mascot.chantyGill} strokeWidth={1.6} strokeLinecap="round" />
        </Part>
        <Part name="brows" as={Path} d="M24.6 22.6l-2.2-1.4M39.4 22.6l2.2-1.4" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.5} strokeLinecap="round" />
        <Part name="eyeL" as={Ellipse} cx={27} cy={24} rx={2.2} ry={2.8} fill={tokens.color.mascot.ink} />
        <Part name="eyeR" as={Ellipse} cx={37} cy={24} rx={2.2} ry={2.8} fill={tokens.color.mascot.ink} />
        <Part name="blushL" as={Ellipse} cx={22} cy={29} rx={2.8} ry={1.7} fill={tokens.color.mascot.blush} />
        <Part name="blushR" as={Ellipse} cx={42} cy={29} rx={2.8} ry={1.7} fill={tokens.color.mascot.blush} />
        <Part name="mouth" as={Path} d="M29 28.5q3 3.2 6 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.8} strokeLinecap="round" />
      </Part>
      <Part name="sparkle" as={Path} d="M55 3l1.2 3.3 3.3 1.2-3.3 1.2L55 12l-1.2-3.3-3.3-1.2 3.3-1.2z" fill={tokens.color.mascot.chartreuse} stroke={tokens.color.mascot.forest} strokeWidth={1} />
    </Svg>
  );
}
