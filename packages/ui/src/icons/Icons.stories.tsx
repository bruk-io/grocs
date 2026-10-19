import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { icons } from './index.ts';
import type { IconName } from './index.ts';

function IconSet({ size }: { size?: number }) {
  return (
    <View style={styles.grid}>
      {(Object.keys(icons) as IconName[]).map((name) => {
        const Icon = icons[name];
        return (
          <View key={name} style={styles.cell}>
            <Icon color={tokens.color.forest} {...(size ? { size } : {})} />
            <Text style={styles.name}>{`icon.${name}`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const meta = { title: 'Icons/Set', component: IconSet } satisfies Meta<typeof IconSet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every icon on the 24 point grid, one round stroke at the width from the tokens. */
export const Grid: Story = {};
/** The same set at 48, to check the stroke scales with the icon. */
export const Large: Story = { args: { size: tokens.size.icon * 2 } };

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[16] },
  cell: { alignItems: 'center', gap: tokens.space[6], paddingHorizontal: tokens.space[4] },
  name: { fontFamily: tokens.font.family.body, fontSize: tokens.font.size.caption, color: tokens.color.inkMuted },
});
