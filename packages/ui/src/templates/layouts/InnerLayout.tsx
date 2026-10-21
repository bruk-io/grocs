import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeArea } from '../../platform/safe-area.tsx';
import { tokens } from '../../tokens/tokens.ts';

export interface InnerLayoutProps {
  /** nav.rail, on the left. */
  rail: ReactNode;
  /** header.main */
  header: ReactNode;
  /** The scrolling content: list.section, cart.section or week.list. */
  children: ReactNode;
}

/** template.main on the Fold's inner screen: the rail on the left, the page filling the rest, no floating tab bar. */
export function InnerLayout({ rail, header, children }: InnerLayoutProps) {
  const inset = useSafeArea();
  return (
    <View style={[styles.screen, { paddingTop: inset.top, paddingLeft: inset.left, paddingRight: inset.right }]}>
      {rail}
      <View style={styles.page}>
        <View style={styles.header}>{header}</View>
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: tokens.space[24] + inset.bottom }]}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: 'row', backgroundColor: tokens.color.surfaceCanvas },
  page: { flex: 1, minWidth: 0 },
  // The header carries its own 16 at the sides; this brings it to the content's 24.
  header: { paddingHorizontal: tokens.space[8] },
  scroll: { flex: 1 },
  content: { gap: tokens.space[14], paddingTop: tokens.space[4], paddingHorizontal: tokens.space[24] },
});
