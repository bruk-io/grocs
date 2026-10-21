import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { WORLD } from '../../organisms/kitchen/art/scene-layout.ts';
import { useSafeArea } from '../../platform/safe-area.tsx';
import { tokens } from '../../tokens/tokens.ts';

export interface StageLayoutProps {
  /** wordmark: the name and tagline over the top of the stage. */
  wordmark: ReactNode;
  /** kitchen.scene, filling the stage. */
  stage: ReactNode;
  /** auth.sheet, at the foot. */
  sheet: ReactNode;
}

/** template.stage: first impressions only. The illustration fills the stage; the sheet holds every action and takes the rest of the screen. */
export function StageLayout({ wordmark, stage, sheet }: StageLayoutProps) {
  const inset = useSafeArea();
  return (
    <View style={styles.screen}>
      <View style={[styles.stage, { paddingTop: inset.top, height: WORLD.height + inset.top }]}>{stage}</View>
      <View pointerEvents="none" style={[styles.wordmark, { top: tokens.space[56] + inset.top }]}>
        {wordmark}
      </View>
      <View style={styles.sheet}>
        <View style={[styles.sheetBody, { paddingLeft: inset.left, paddingRight: inset.right }]}>{sheet}</View>
        {/* The sheet's colour carries on under the gesture bar. */}
        <View style={{ height: inset.bottom, backgroundColor: tokens.color.surfaceCard }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surfaceStage },
  // The scene is drawn at its own height; the sheet's rounded top overlaps its floor.
  stage: { height: WORLD.height },
  wordmark: { position: 'absolute', top: tokens.space[56], left: 0, right: 0, alignItems: 'center', gap: tokens.space[6] },
  sheet: { flex: 1, marginTop: -tokens.space[4] },
  sheetBody: { flex: 1 },
});
