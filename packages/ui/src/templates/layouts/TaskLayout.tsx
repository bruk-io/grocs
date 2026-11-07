import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeArea } from '../../platform/safe-area.tsx';
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
  const inset = useSafeArea();
  // Whatever sits last on the screen clears the gesture bar; the action bar does that itself.
  const clear = tokens.space[24] + inset.bottom;
  // iOS lays the keyboard over the screen; padding lifts the action bar above it (TASK-73). Android resizes the window itself.
  // "handled": a tap on Add, Paste or any other control inside the form works while the keyboard is open, rather than only closing it (TASK-61).
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: inset.top, paddingLeft: inset.left, paddingRight: inset.right }]}
    >
      {header}
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, !footer && !actionBar && { paddingBottom: clear }]}>
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, !actionBar && { paddingBottom: clear }]}>{footer}</View> : null}
      {actionBar}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surfaceCanvas },
  scroll: { flex: 1 },
  content: { gap: tokens.space[14], paddingHorizontal: tokens.space[16], paddingBottom: tokens.space[24] },
  footer: { alignItems: 'center', paddingHorizontal: tokens.space[16], paddingBottom: tokens.space[24] },
});
