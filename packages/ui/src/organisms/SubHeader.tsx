import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Tag } from '../atoms/Tag.tsx';
import { Text } from '../atoms/Text.tsx';
import { Mascot } from '../molecules/Mascot.tsx';
import type { MascotProps } from '../molecules/Mascot.tsx';
import type { MascotName } from '../mascots/art/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** header.sub on a task screen: with a back link, with a plain line above it (Settings, Your kitchen), or with the wordmark when nothing sits behind it (Join). */
export const SUBHEADER_STATES = ['back', 'line', 'wordmark'] as const;

/** What sits above the title. */
export type SubHeaderLead =
  | { kind: 'back'; /** The name of the parent screen, such as "Meal plan". */ label: string; onPress?: () => void }
  | { kind: 'line'; text: string }
  | { kind: 'wordmark' };

export interface SubHeaderProps {
  lead: SubHeaderLead;
  /** The small tag above the title, such as "Thursday, Oct 22". */
  tag?: string;
  title: string;
  mascot: MascotName;
  /** Pins the mascot's state for stories and baselines; the phones never set it. */
  mascotState?: MascotProps['forceState'];
}

/** The top of a task screen (button.back, tag.date, text.title-m, mascot). */
export function SubHeader({ lead, tag, title, mascot, mascotState }: SubHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.lead}>
        {lead.kind === 'back' ? (
          <Button variant="back" label={lead.label} {...(lead.onPress ? { onPress: lead.onPress } : {})} />
        ) : lead.kind === 'wordmark' ? (
          <Text variant="title" tone="forest">
            Grocs
          </Text>
        ) : (
          <Text variant="label" tone="muted">
            {lead.text}
          </Text>
        )}
      </View>
      <View style={styles.titleRow}>
        <View style={styles.title}>
          {tag ? <Tag label={tag} kind="date" /> : null}
          <Text variant="titleM" accessibilityRole="header">
            {title}
          </Text>
        </View>
        <Mascot name={mascot} bubbleSide="left" {...(mascotState ? { forceState: mascotState } : {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: tokens.space[10], paddingTop: tokens.space[16], paddingHorizontal: tokens.space[16], paddingBottom: tokens.space[12] },
  lead: { minHeight: tokens.size.target, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: tokens.space[12] },
  title: { flex: 1, minWidth: 0, gap: tokens.space[8] },
});
