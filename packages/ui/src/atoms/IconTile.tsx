import { StyleSheet, View } from 'react-native';
import { icons } from '../icons/index.ts';
import type { IconName } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** icon.tile: a tinted square holding one icon. Decorative, so one state. */
export const ICONTILE_STATES = ['rest'] as const;

export interface IconTileProps {
  icon: IconName;
}

export function IconTile({ icon }: IconTileProps) {
  const Glyph = icons[icon];
  return (
    <View aria-hidden style={styles.tile}>
      <Glyph color={tokens.color.forest} size={tokens.size.iconTileGlyph} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: tokens.size.tile,
    height: tokens.size.tile,
    borderRadius: tokens.radius[10],
    backgroundColor: tokens.color.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
