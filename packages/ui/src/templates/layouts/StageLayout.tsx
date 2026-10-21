import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
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

/** template.stage: first impressions only. The illustration fills the stage; the sheet holds every action and is only as tall as its content. */
export function StageLayout({ wordmark, stage, sheet }: StageLayoutProps) {
  const inset = useSafeArea();
  return (
    <View style={styles.screen}>
      <View style={[styles.stage, { paddingTop: inset.top }]}>
        <View style={styles.scene}>{stage}</View>
        <View pointerEvents="none" style={[styles.wordmark, { top: tokens.space[24] + inset.top }]}>
          {wordmark}
        </View>
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
  // The stage takes whatever the sheet leaves; the scene scales to fill it, and its ceiling colour carries up under the inset.
  stage: { flex: 1, minHeight: 0, backgroundColor: tokens.color.scene.ceiling },
  // Over the scene's own ceiling, above the cast at every height.
  wordmark: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: tokens.space[6] },
  scene: { flex: 1, minHeight: 0 },
  sheet: { marginTop: -tokens.space[4] },
  sheetBody: {},
});
