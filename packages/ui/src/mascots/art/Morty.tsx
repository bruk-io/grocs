// GENERATED from design/svg/mascots/morty.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { Circle, Ellipse, G, Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../tokens/tokens.ts';
import { Part } from '../part.tsx';

export function MortyArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 64 64" {...props}>
      <Part name="body" as={G}>
        <Part name="scrub" as={Ellipse} cx={18} cy={46} rx={5} ry={3.2} fill={tokens.color.mascot.mortyStem} transform="rotate(-20 18 46)" opacity={0} />
        <Part name="tomato" as={G} opacity={0}>
          <Circle cx={12} cy={42} r={5.5} fill={tokens.color.mascot.tomato} />
          <Path d="M12 37l1-2" stroke={tokens.color.mascot.leaf} strokeWidth={2} strokeLinecap="round" />
        </Part>
        <Part name="stem" as={Path} d="M24 36h16l1 18a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z" fill={tokens.color.mascot.mortyStem} />
        <Part name="cap" as={G}>
          <Path d="M32 3c10 0 16 12 16 26 0 6-3 9-8 9H24c-5 0-8-3-8-9C16 15 22 3 32 3z" fill={tokens.color.mascot.mortyCap} />
          <G fill={tokens.color.mascot.mortyPit}>
            <Ellipse cx={27} cy={13} rx={2.4} ry={3.2} />
            <Ellipse cx={36.5} cy={12} rx={2.2} ry={3} />
            <Ellipse cx={23} cy={23} rx={2.4} ry={3.2} />
            <Ellipse cx={32} cy={21.5} rx={2.6} ry={3.4} />
            <Ellipse cx={41} cy={23} rx={2.4} ry={3.2} />
            <Ellipse cx={27.5} cy={31} rx={2.6} ry={3} />
            <Ellipse cx={37} cy={31} rx={2.6} ry={3} />
          </G>
        </Part>
        <Part name="eyeL" as={Ellipse} cx={28} cy={45} rx={1.8} ry={2.3} fill={tokens.color.mascot.ink} />
        <Part name="eyeR" as={Ellipse} cx={36} cy={45} rx={1.8} ry={2.3} fill={tokens.color.mascot.ink} />
        <Part name="glassesL" as={Circle} cx={28} cy={45} r={3.8} fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.4} />
        <Part name="glassesR" as={Circle} cx={36} cy={45} r={3.8} fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.4} />
        <Part name="blushL" as={Ellipse} cx={23} cy={50.5} rx={2.2} ry={1.4} fill={tokens.color.mascot.blush} />
        <Part name="blushR" as={Ellipse} cx={41} cy={50.5} rx={2.2} ry={1.4} fill={tokens.color.mascot.blush} />
        <Part name="mouth" as={Path} d="M30 51.5q2 1.6 4 0" fill="none" stroke={tokens.color.mascot.ink} strokeWidth={1.6} strokeLinecap="round" />
      </Part>
    </Svg>
  );
}
