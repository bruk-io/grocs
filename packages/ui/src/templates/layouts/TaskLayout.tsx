import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { tokens } from '../../tokens/tokens.ts';

export interface TaskLayoutProps {
  /** header.sub */
  header: ReactNode;
  /** The one job of the screen: fields, cards, rows. */
  children: ReactNode;
  /** action.bar, left out when the job happens inline. */
  actionBar?: ReactNode;
  /** A quiet line pinned to the bottom, such as "Not expecting this? You can ignore it." */
  footer?: ReactNode;
}

/** template.task: one job per screen. The back link names the parent; the action bar is optional. */
export function TaskLayout({ header, children, actionBar, footer }: TaskLayoutProps) {
  return (
    <View style={styles.screen}>
      {header}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
      {actionBar}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surfaceCanvas },
  scroll: { flex: 1 },
  content: { gap: tokens.space[14], paddingHorizontal: tokens.space[20], paddingBottom: tokens.space[24] },
  footer: { alignItems: 'center', paddingHorizontal: tokens.space[20], paddingBottom: tokens.space[24] },
});
