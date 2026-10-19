import { StyleSheet, View } from 'react-native';
import { icons } from '../icons/index.ts';
import type { IconName } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** icon.tile: a tinted square holding one icon. Decorative, so one state. */
export const ICONTILE_STATES = ['rest', 'positive'] as const;

export interface IconTileProps {
  icon: IconName;
  /** positive is the green tint the cart section wears. */
  tone?: 'tint' | 'positive';
}

export function IconTile({ icon, tone = 'tint' }: IconTileProps) {
  const Glyph = icons[icon];
  return (
    <View aria-hidden style={[styles.tile, tone === 'positive' && styles.positive]}>
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
  positive: { backgroundColor: tokens.color.positiveTint },
});
