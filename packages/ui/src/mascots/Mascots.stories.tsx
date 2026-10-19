import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { mascotArt } from './art/index.ts';
import type { MascotName } from './art/index.ts';

/** The art alone, at the header size. The Mascot component (animation, tap, speech) comes later. */
function MascotArt({ name, size = tokens.size.mascotHeader }: { name: MascotName; size?: number }) {
  const Art = mascotArt[name];
  return (
    <View style={styles.cell}>
      <Art width={size} height={size} />
      <Text style={styles.name}>{`mascot.${name}`}</Text>
    </View>
  );
}

function AllMascots() {
  return (
    <View style={styles.row}>
      {(Object.keys(mascotArt) as MascotName[]).map((name) => (
        <MascotArt key={name} name={name} />
      ))}
    </View>
  );
}

const meta = { title: 'Mascots/Art', component: MascotArt, args: { name: 'cremi' } } satisfies Meta<typeof MascotArt>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Cremi: Story = { args: { name: 'cremi', size: tokens.size.avatarXl * 3 } };
export const Shii: Story = { args: { name: 'shii', size: tokens.size.avatarXl * 3 } };
export const Chanty: Story = { args: { name: 'chanty', size: tokens.size.avatarXl * 3 } };
export const Ollie: Story = { args: { name: 'ollie', size: tokens.size.avatarXl * 3 } };
export const Morty: Story = { args: { name: 'morty', size: tokens.size.avatarXl * 3 } };
export const Enoki: Story = { args: { name: 'enoki', size: tokens.size.avatarXl * 3 } };
/** All six at the header size, as the design system board shows them. */
export const Together: StoryObj<typeof AllMascots> = { render: () => <AllMascots /> };

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space[16] },
  cell: { alignItems: 'center', gap: tokens.space[6] },
  name: { fontFamily: tokens.font.family.body, fontSize: tokens.font.size.caption, color: tokens.color.inkMuted },
});
