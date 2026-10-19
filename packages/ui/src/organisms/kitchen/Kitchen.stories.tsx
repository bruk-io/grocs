import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { KitchenArt } from './art/Kitchen.tsx';
import { KitchenDoorArt } from './art/KitchenDoor.tsx';

/** The Welcome kitchen scene, drawn still. It is wider than any phone; the pan comes with the Welcome screen. */
function KitchenScene({ withDoor }: { withDoor: boolean }) {
  return (
    <View style={{ aspectRatio: 1020 / 600 }}>
      <KitchenArt width="100%" height="100%" />
      {withDoor ? (
        <View style={{ position: 'absolute', left: '37.5%', top: '40.5%', width: '8.1%', aspectRatio: 83 / 120 }}>
          <KitchenDoorArt width="100%" height="100%" />
        </View>
      ) : null}
    </View>
  );
}

const meta = { title: 'Organisms/Kitchen scene', component: KitchenScene, args: { withDoor: true } } satisfies Meta<typeof KitchenScene>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Still: Story = {};
export const WithoutDoor: Story = { args: { withDoor: false } };
