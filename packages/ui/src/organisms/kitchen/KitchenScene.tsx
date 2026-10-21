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

/** A world coordinate as a share of the world's own extent. */
const pct = (value: number, of: number) => `${(value / of) * 100}%` as const;

/**
 * Six hosts at home in one kitchen. The camera pans along it unless motion is reduced (R41, R60).
 * The world is a box as tall as its window with the scene's own aspect ratio, so layout does the sizing and the
 * sides clip: the art scales by its viewBox and everything else sits in percentages. Only the pan and the
 * hosts' pixel sizes read the window's measure, never the layout.
 */
export function KitchenScene({ onMascotPress }: KitchenSceneProps) {
  const { reduced } = useMotion();
  const [size, setSize] = useState<{ width: number; height: number }>(WORLD);
  const scale = size.height / WORLD.height;
  const visibleWidth = size.width / scale;
  const motion = useMemo(() => sceneMotion(reduced, visibleWidth, scale), [reduced, visibleWidth, scale]);
  const place = (host: CastPlace) => (
    <View key={host.name} style={[styles.host, { left: pct(host.left, WORLD.width), top: pct(host.top, WORLD.height) }]}>
      <Mascot name={host.name} size={host.size * scale} {...(host.pose ? { pose: host.pose } : {})} {...(onMascotPress ? { onPress: (line: string) => onMascotPress(host.name, line) } : {})} />
    </View>
  );
  return (
    <View style={styles.window} onLayout={(e) => setSize({ width: e.nativeEvent.layout.width || WORLD.width, height: e.nativeEvent.layout.height || WORLD.height })}>
      <Animated.View testID="kitchen-world" style={[styles.world, motion.pan]}>
        <Animated.View style={[styles.fill, motion.bob]}>
          <PartPropsContext.Provider value={motion.parts}>
            <KitchenArt width="100%" height="100%" style={styles.fill} />
          </PartPropsContext.Provider>
          {CAST_BEHIND_DOOR.map(place)}
          <Animated.View aria-hidden style={[styles.door, motion.door]}>
            <KitchenDoorArt width="100%" height="100%" />
          </Animated.View>
          {CAST_IN_FRONT.map(place)}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { flex: 1, overflow: 'hidden', backgroundColor: tokens.color.scene.ceiling },
  // Absolute, so the world's width (wider than a phone) takes no part in the window's own layout; its height is the window's.
  world: { position: 'absolute', left: 0, top: 0, height: '100%', aspectRatio: WORLD.width / WORLD.height },
  fill: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  host: { position: 'absolute' },
  door: { position: 'absolute', left: pct(DOOR.left, WORLD.width), top: pct(DOOR.top, WORLD.height), width: pct(DOOR.width, WORLD.width), height: pct(DOOR.height, WORLD.height) },
});
