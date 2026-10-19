import { StyleSheet, View } from 'react-native';
import type { IconName } from '../icons/index.ts';
import { TabItem } from '../molecules/TabItem.tsx';
import { tokens } from '../tokens/tokens.ts';

/** nav.tabs: the bottom bar with the first tab showing and with the second. */
export const NAVTABS_STATES = ['planActive', 'groceriesActive'] as const;

export interface NavTab {
  id: string;
  label: string;
  icon: IconName;
  /** A number on the tab, such as what is still to buy. */
  count?: number;
}

export interface NavTabsProps {
  tabs: readonly NavTab[];
  /** The id of the tab whose page is showing. */
  activeId: string;
  onSelect?: (id: string) => void;
}

/** The two homes, floating above the bottom edge (tab.item x 2). */
export function NavTabs({ tabs, activeId, onSelect }: NavTabsProps) {
  return (
    <View accessibilityRole="tablist" aria-label="Main" style={styles.bar}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          active={tab.id === activeId}
          {...(tab.count !== undefined ? { count: tab.count } : {})}
          onPress={() => onSelect?.(tab.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: tokens.space[4],
    padding: tokens.space[8],
    borderRadius: tokens.radius[24],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.lineSoft,
    backgroundColor: tokens.color.surfaceCard,
    boxShadow: [...tokens.shadow.nav],
  },
});
