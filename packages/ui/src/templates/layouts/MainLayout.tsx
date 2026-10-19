import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { tokens } from '../../tokens/tokens.ts';

export interface MainLayoutProps {
  /** header.main */
  header: ReactNode;
  /** The scrolling content: list.section, cart.section or week.list. */
  children: ReactNode;
  /** nav.tabs, floating above the bottom edge. */
  nav: ReactNode;
}

/** template.main: the two homes. Content scrolls under the floating tab bar; the last row stays clear by the nav clearance token. */
export function MainLayout({ header, children, nav }: MainLayoutProps) {
  return (
    <View style={styles.screen}>
      {header}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      <View style={styles.nav}>{nav}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surfaceCanvas },
  scroll: { flex: 1 },
  content: { gap: tokens.space[14], paddingHorizontal: tokens.space[16], paddingBottom: tokens.size.navClearance },
  nav: { position: 'absolute', left: tokens.space[16], right: tokens.space[16], bottom: tokens.space[20] },
});
