import { StyleSheet, View } from 'react-native';
import { Count } from '../atoms/Count.tsx';
import { IconTile } from '../atoms/IconTile.tsx';
import { Text } from '../atoms/Text.tsx';
import type { IconName } from '../icons/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** A section header is only ever read: one state. */
export const SECTIONHEADER_STATES = ['rest'] as const;

export interface SectionHeaderProps {
  icon: IconName;
  title: string;
  /** How many things are in the section. */
  count: number;
}

/** The header of a list section: its icon, its name and how many items it holds (icon.tile, text.heading, count.neutral). */
export function SectionHeader({ icon, title, count }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <IconTile icon={icon} />
      <View style={styles.title} accessibilityRole="header">
        <Text variant="heading">{title}</Text>
      </View>
      <Count value={count} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[8] },
  title: { flex: 1 },
});
