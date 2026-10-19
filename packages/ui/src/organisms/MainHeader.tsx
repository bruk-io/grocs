import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { AddBar } from '../molecules/AddBar.tsx';
import type { AddBarProps } from '../molecules/AddBar.tsx';
import { AvatarStack } from '../molecules/AvatarStack.tsx';
import type { StackMember } from '../molecules/AvatarStack.tsx';
import { Mascot } from '../molecules/Mascot.tsx';
import { ProgressBar } from '../molecules/ProgressBar.tsx';
import type { ProgressBarProps } from '../molecules/ProgressBar.tsx';
import { WeekNav } from '../molecules/WeekNav.tsx';
import type { WeekNavProps } from '../molecules/WeekNav.tsx';
import type { MascotName } from '../mascots/art/index.ts';
import { tokens } from '../tokens/tokens.ts';

/** header.main on the two home screens: Groceries (progress and the add bar) and Meal plan (week nav, no progress). */
export const MAINHEADER_STATES = ['groceries', 'mealPlan'] as const;

export interface MainHeaderProps {
  /** The page name, such as "Groceries" or "This week". */
  title: string;
  /** The small line top left, such as "Week of Oct 19". Left out when `weekNav` is given. */
  eyebrow?: string;
  /** Steps the plan a week at a time; takes the eyebrow's place. */
  weekNav?: WeekNavProps;
  /** The household, as avatars. */
  members: readonly StackMember[];
  onSettings?: () => void;
  /** Which mushroom sits beside the title. */
  mascot: MascotName;
  /** The shop's progress under the title. Groceries only. */
  progress?: ProgressBarProps;
  /** The add field under the title. Groceries only. */
  addBar?: AddBarProps;
}

/** The top of a home screen (avatar.stack, button.icon--ghost, text.title-l, progress.bar, mascot, add.bar). */
export function MainHeader({ title, eyebrow, weekNav, members, onSettings, mascot, progress, addBar }: MainHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        {weekNav ? (
          <WeekNav {...weekNav} />
        ) : (
          <Text variant="label" tone="muted">
            {eyebrow}
          </Text>
        )}
        <View style={styles.who}>
          <AvatarStack members={members} />
          <Button variant="iconGhost" icon="settings" label="Settings" {...(onSettings ? { onPress: onSettings } : {})} />
        </View>
      </View>
      <View style={styles.titleRow}>
        <View style={styles.title}>
          <Text variant="titleL" accessibilityRole="header">
            {title}
          </Text>
          {progress ? <ProgressBar {...progress} /> : null}
        </View>
        <Mascot name={mascot} />
      </View>
      {addBar ? <AddBar {...addBar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: tokens.space[10], paddingTop: tokens.space[16], paddingHorizontal: tokens.space[20], paddingBottom: tokens.space[12] },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  who: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[4] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: tokens.space[12] },
  title: { flex: 1, minWidth: 0, gap: tokens.space[10] },
});
