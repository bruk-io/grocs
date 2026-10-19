// GENERATED from design/svg/scenes/kitchen-door.svg by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg

import { G, Path, Rect, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import { tokens } from '../../../tokens/tokens.ts';
import { Part } from '../../../mascots/part.tsx';

export function KitchenDoorArt(props: SvgProps) {
  return (
    <Svg viewBox="0 0 83 120" {...props}>
      <Part name="door" as={G}>
        <Rect x={0} y={0} width={83} height={120} rx={8} fill={tokens.color.scene.hebdcc2} />
        <Path d="M10 22q30-5 62 1M10 88q30 5 62-2" fill="none" stroke={tokens.color.scene.hdcc8a6} strokeWidth={1.5} strokeLinecap="round" />
      </Part>
    </Svg>
  );
}
