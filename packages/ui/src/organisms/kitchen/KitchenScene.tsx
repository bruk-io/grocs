import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Mascot } from '../../molecules/Mascot.tsx';
import type { MascotName } from '../../mascots/art/index.ts';
import { PartPropsContext } from '../../mascots/part.tsx';
import { useMotion } from '../../platform/motion.tsx';
import { tokens } from '../../tokens/tokens.ts';
import { KitchenArt } from './art/Kitchen.tsx';
import { KitchenDoorArt } from './art/KitchenDoor.tsx';
import { CAST_BEHIND_DOOR, CAST_IN_FRONT, DOOR, WORLD } from './art/scene-layout.ts';
import type { CastPlace } from './art/scene-layout.ts';
import { sceneMotion } from './motion.ts';

/** kitchen.scene: panning (motion on), and reduced (the same kitchen held still: the camera at the fridge, the door shut). */
export const KITCHENSCENE_STATES = ['panning', 'reduced'] as const;

export interface KitchenSceneProps {
  /** A host was tapped; they have already reacted and spoken. */
  onMascotPress?: (name: MascotName, line: string) => void;
}

/** Six hosts at home in one kitchen. The camera pans along it unless motion is reduced (R41, R60); it is drawn at 1020 x 600 and scaled evenly so its height fills its parent, which sets the window; the sides clip. */
export function KitchenScene({ onMascotPress }: KitchenSceneProps) {
  const { reduced } = useMotion();
  const [size, setSize] = useState<{ width: number; height: number }>(WORLD);
  const scale = size.height / WORLD.height;
  const visibleWidth = size.width / scale;
  const motion = useMemo(() => sceneMotion(reduced, visibleWidth), [reduced, visibleWidth]);
  const place = (host: CastPlace) => (
    <View key={host.name} style={[styles.host, { left: host.left, top: host.top }]}>
      <Mascot name={host.name} size={host.size} {...(host.pose ? { pose: host.pose } : {})} {...(onMascotPress ? { onPress: (line: string) => onMascotPress(host.name, line) } : {})} />
    </View>
  );
  return (
    <View style={styles.window} onLayout={(e) => setSize({ width: e.nativeEvent.layout.width || WORLD.width, height: e.nativeEvent.layout.height || WORLD.height })}>
      <View style={[styles.world, { transform: [{ scale }] }]}>
        <Animated.View style={[styles.fill, motion.pan]}>
          <Animated.View style={[styles.fill, motion.bob]}>
            <PartPropsContext.Provider value={motion.parts}>
              <KitchenArt width={WORLD.width} height={WORLD.height} style={styles.fill} />
            </PartPropsContext.Provider>
            {CAST_BEHIND_DOOR.map(place)}
            <Animated.View aria-hidden style={[styles.door, motion.door]}>
              <KitchenDoorArt width="100%" height="100%" />
            </Animated.View>
            {CAST_IN_FRONT.map(place)}
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { flex: 1, overflow: 'hidden', backgroundColor: tokens.color.scene.ceiling },
  world: { width: WORLD.width, height: WORLD.height, transformOrigin: 'left top' },
  fill: { position: 'absolute', left: 0, top: 0, width: WORLD.width, height: WORLD.height },
  host: { position: 'absolute' },
  door: { position: 'absolute', left: DOOR.left, top: DOOR.top, width: DOOR.width, height: DOOR.height },
});
